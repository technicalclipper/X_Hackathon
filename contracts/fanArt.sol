// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract FanEngagementPool is ERC721URIStorage, Ownable {
    address[] public fanTokens;
    mapping(address => bool) public isApprovedToken;
    uint256 public poolCount;
    uint256 public nftCounter;

    enum PoolType { TIFO, MATCH_VIDEO, JERSEY, TICKETS }

    struct Pool {
        uint256 id;
        PoolType poolType;
        string matchId;
        uint256 submissionDeadline;
        uint256 votingDeadline;
        bool active;
        bool winnerMinted;
    }

    struct Submission {
        uint256 id;
        uint256 poolId;
        address creator;
        string contentUrl;
        uint256 voteCount;
    }

    struct Auction {
        address seller;
        uint256 tokenId;
        uint256 highestBid;
        address highestBidder;
        uint256 minBid;
        uint256 requiredPsgTokens;
        bool active;
    }

    mapping(uint256 => Pool) public pools;
    mapping(uint256 => Submission[]) public poolSubmissions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    mapping(uint256 => Auction) public auctions;

    event PoolCreated(uint256 poolId, PoolType poolType, string matchId);
    event SubmissionMade(uint256 poolId, uint256 submissionId, address creator);
    event Voted(uint256 poolId, uint256 submissionId, address voter);
    event WinnerMinted(uint256 poolId, uint256 submissionId, address to, uint256 tokenId);
    event AuctionCreated(uint256 tokenId, address seller, uint256 minBid, uint256 requiredPsgTokens);
    event BidPlaced(uint256 tokenId, address bidder, uint256 amount);
    event AuctionEnded(uint256 tokenId, address winner, uint256 amount);
    event FanTokenAdded(address token);

    function addFanToken(address token) external onlyOwner {
        require(!isApprovedToken[token], "Already approved");
        require(token != address(0), "Zero address");
        isApprovedToken[token] = true;
        fanTokens.push(token);
        emit FanTokenAdded(token);
    }

    function getFanTokens() external view returns (address[] memory) {
        return fanTokens;
    }

    function holdsAtLeast(address user, uint256 minTokens) public view returns (bool) {
        for (uint256 i = 0; i < fanTokens.length; i++) {
            if (IERC20(fanTokens[i]).balanceOf(user) >= minTokens) return true;
        }
        return false;
    }

    constructor() ERC721("FanEngagementNFT", "FENFT") Ownable(msg.sender) {}


    modifier requireTokens(address user, uint256 minTokens) {
        require(holdsAtLeast(user, minTokens), "Insufficient fan tokens");
        _;
    }

    function createPool(
        PoolType _poolType,
        string memory _matchId,
        uint256 _submissionDeadline,
        uint256 _votingDeadline
    ) external onlyOwner {
        require(_submissionDeadline < _votingDeadline, "Submission must end before voting");

        poolCount++;
        pools[poolCount] = Pool({
            id: poolCount,
            poolType: _poolType,
            matchId: _matchId,
            submissionDeadline: _submissionDeadline,
            votingDeadline: _votingDeadline,
            active: true,
            winnerMinted: false
        });

        emit PoolCreated(poolCount, _poolType, _matchId);
    }

    function submitToPool(uint256 _poolId, string memory _contentUrl)
        external
        requireTokens(msg.sender, 10 * 10**18)
    {
        Pool memory pool = pools[_poolId];
        require(pool.active, "Pool is not active");
        require(block.timestamp <= pool.submissionDeadline, "Submission deadline passed");

        uint256 newId = poolSubmissions[_poolId].length;
        poolSubmissions[_poolId].push(
            Submission({
                id: newId,
                poolId: _poolId,
                creator: msg.sender,
                contentUrl: _contentUrl,
                voteCount: 0
            })
        );

        emit SubmissionMade(_poolId, newId, msg.sender);
    }

    function vote(uint256 _poolId, uint256 _submissionId)
        external
        requireTokens(msg.sender, 10 * 10**18)
    {
        Pool memory pool = pools[_poolId];
        require(pool.active, "Pool is not active");
        require(block.timestamp > pool.submissionDeadline, "Voting not started yet");
        require(block.timestamp <= pool.votingDeadline, "Voting deadline passed");
        require(!hasVoted[_poolId][msg.sender], "You have already voted");

        Submission storage submission = poolSubmissions[_poolId][_submissionId];
        submission.voteCount += 1;

        hasVoted[_poolId][msg.sender] = true;

        emit Voted(_poolId, _submissionId, msg.sender);
    }

    function mintWinner(uint256 _poolId) external onlyOwner {
        Pool storage pool = pools[_poolId];
        require(block.timestamp > pool.votingDeadline, "Voting still active");
        require(!pool.winnerMinted, "Winner already minted");

        Submission[] memory submissions = poolSubmissions[_poolId];
        require(submissions.length > 0, "No submissions");

        uint256 winningIndex;
        uint256 highestVotes = 0;

        for (uint256 i = 0; i < submissions.length; i++) {
            if (submissions[i].voteCount > highestVotes) {
                highestVotes = submissions[i].voteCount;
                winningIndex = i;
            }
        }

        Submission memory winner = submissions[winningIndex];

        nftCounter++;
        _safeMint(winner.creator, nftCounter);
        _setTokenURI(nftCounter, winner.contentUrl);

        pool.winnerMinted = true;

        emit WinnerMinted(_poolId, winner.id, winner.creator, nftCounter);
    }

    function getSubmissions(uint256 _poolId) external view returns (Submission[] memory) {
        return poolSubmissions[_poolId];
    }

    function closePool(uint256 _poolId) external onlyOwner {
        pools[_poolId].active = false;
    }

    // ===== Auction Marketplace Functions =====

    function createAuction(uint256 tokenId, uint256 minBid, uint256 requiredPsgTokens) external {
        require(ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        auctions[tokenId] = Auction({
            seller: msg.sender,
            tokenId: tokenId,
            highestBid: 0,
            highestBidder: address(0),
            minBid: minBid,
            requiredPsgTokens: requiredPsgTokens,
            active: true
        });
        emit AuctionCreated(tokenId, msg.sender, minBid, requiredPsgTokens);
    }

    function placeBid(uint256 tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction is not active");
        require(holdsAtLeast(msg.sender, auction.requiredPsgTokens), "Not enough fan tokens to bid");
        require(msg.value > auction.highestBid, "Bid must be higher");
        require(msg.value >= auction.minBid, "Bid below minimum");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) external {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(auction.seller == msg.sender, "Only seller can end");

        auction.active = false;

        if (auction.highestBidder != address(0)) {
            _transfer(auction.seller, auction.highestBidder, tokenId);
            payable(auction.seller).transfer(auction.highestBid);
        }

        emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
    }
}
