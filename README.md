# 🌍 Fanvas X Cup — Democratizing World Cup Fan Art, On-Chain

<div align="center">

![Fanvas Logo](https://img.shields.io/badge/Fanvas-X%20Cup%20Edition-blue?style=for-the-badge)
![X Layer](https://img.shields.io/badge/X%20Layer-Testnet-orange?style=for-the-badge)
![World Cup](https://img.shields.io/badge/Theme-FIFA%20World%20Cup-green?style=for-the-badge)

**Where World Cup fandom meets blockchain, on X Layer** 🏆⚽

Built for [OKX X Cup Hackathon](https://web3.okx.com/xlayer/build-x-hackathon/xcup) — tag [@XLayerOfficial](https://x.com/XLayerOfficial)

🌐 **[Live Demo → fanvasx.vercel.app](https://fanvasx.vercel.app)**

</div>

---

## 🎬 Demo

<div align="center">

<video src="media/fanvas canva.mp4" width="100%" controls></video>

> _Can't play inline? [Download the demo video](media/fanvas%20canva.mp4)_

</div>

---

## 🌟 Powered by X Layer + Country Fan Tokens

Fanvas is a blockchain-powered platform that lets World Cup fans design, vote, and own official team visuals — gated by holding country fan tokens (ARG / BRA / FRA) on X Layer Testnet.

Supporters can create **Tifos**, **Jerseys**, **Posters**, **Matchday Tickets**, and **Stadium Banners** using our in-app 3D canvas tool.

---

## 🚀 What makes Fanvas X Cup work?

| Feature | Description | X Layer Integration |
|---------|-------------|---------------------|
| 🗳️ **Decentralized Voting** | Token-gated voting | Holding ≥10 of any country fan token unlocks voting |
| 🏆 **NFT Minting** | Winners minted on X Layer | ERC-721 with IPFS metadata |
| 💰 **Fan-Only Auctions** | Exclusive bidding | OKB bids on X Layer Testnet |

### 🎯 **Key Innovations**

- **🗳️ Decentralized & Token-Gated Voting**: Only fans holding a minimum number of country fan tokens (e.g., **ARG / BRA / FRA tokens on X Layer**) can vote on the best designs — ensuring that real fans shape the team's visuals, not just a central team.

- **🏆 NFT Minting for Winners**: Top-voted designs are minted as NFTs. Imagine seeing your fan-designed Tifo at a legendary match, and owning it digitally forever. These moments are captured as NFTs and tied to their creators — **your fandom becomes your legacy**.

- **💰 Fan-Only Auctions**: Once minted, the winning NFTs are listed for auction. Bidding requires a minimum fan token balance, making sure it's **fans supporting fans** — using OKB as the currency on X Layer.

> **Fanvas isn't just a platform — it's a movement to democratize fan-driven creativity, giving real supporters a say in how their team looks and feels.**

By bridging fan culture with Web3, Fanvas creates emotional and economic value, incentivizing creativity, and **expanding utility for fan tokens** — all while fueling the growth of the **X Layer ecosystem**.

---

## ��️ **Architecture**

### 🎯 **Smart Contract: `FanEngagementPool.sol`**

The core smart contract that handles all fan engagement activities:

#### **📊 Core Data Structures**

```solidity
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
    uint256 requiredFanTokens;  // 🎯 X Layer Fan Token Integration
    bool active;
}
```

#### **🔧 Contract Functions Explained**

<div align="center">

| Function Category | Functions | Access Control |
|------------------|-----------|----------------|
| 🏊‍♂️ **Pool Management** | `createPool()`, `closePool()` | Owner Only |
| 📝 **Content Submission** | `submitToPool()` | Token-Gated |
| 🗳️ **Voting System** | `vote()` | Token-Gated |
| 🏆 **Winner Selection** | `mintWinner()` | Owner Only |
| 🛒 **Auction Marketplace** | `createAuction()`, `placeBid()`, `endAuction()` | Public/Token-Gated |
| 🔍 **Utility** | `getSubmissions()`, `balanceOf()` | View Functions |

</div>

##### **🏊‍♂️ Pool Management**

1. **`createPool(PoolType, string, uint256, uint256)`** - *Owner Only*
   - Creates a new fan engagement pool
   - Parameters: pool type (TIFO/MATCH_VIDEO/JERSEY/TICKETS), match ID, submission deadline, voting deadline
   - Requires submission deadline to be before voting deadline
   - Emits `PoolCreated` event

2. **`closePool(uint256)`** - *Owner Only*
   - Deactivates a pool, preventing new submissions and votes
   - Used when a pool needs to be terminated early

##### **📝 Content Submission**

3. **`submitToPool(uint256, string)`** - *Token-Gated*
   - Allows fans to submit content to an active pool
   - **Requires minimum 10 country fan tokens balance (ARG / BRA / FRA)** 🎯
   - Content URL points to IPFS/metadata
   - Emits `SubmissionMade` event

##### **🗳️ Voting System**

4. **`vote(uint256, uint256)`** - *Token-Gated*
   - Allows fans to vote on submissions
   - **Requires minimum 10 country fan tokens balance (ARG / BRA / FRA)** 🎯
   - One vote per wallet per pool
   - Only active during voting period
   - Emits `Voted` event

##### **🏆 Winner Selection & NFT Minting**

5. **`mintWinner(uint256)`** - *Owner Only*
   - Mints NFT for the highest-voted submission
   - Can only be called after voting deadline
   - Automatically selects submission with most votes
   - Transfers NFT to winning creator
   - Sets token URI to winning content
   - Emits `WinnerMinted` event

##### **🛒 Auction Marketplace**

6. **`createAuction(uint256, uint256, uint256)`**
   - Allows NFT owners to create auctions
   - Sets minimum bid and **required fan tokens for bidders** 🎯
   - Only NFT owner can create auction
   - Emits `AuctionCreated` event

7. **`placeBid(uint256)`** - *Payable*
   - Allows fans to bid on NFTs
   - **Requires minimum fan token balance (ARG / BRA / FRA)** 🎯
   - Bid must be higher than current highest bid
   - Automatically refunds previous highest bidder
   - Emits `BidPlaced` event

8. **`endAuction(uint256)`**
   - Allows auction seller to end auction
   - Transfers NFT to highest bidder
   - Transfers ETH to seller
   - If no bids, NFT remains with seller
   - Emits `AuctionEnded` event

##### **🔍 Utility Functions**

9. **`getSubmissions(uint256)`** - *View*
   - Returns all submissions for a specific pool
   - Used by frontend to display submissions

10. **`balanceOf(address)`** - *View* (Inherited from ERC721)
    - Returns number of NFTs owned by an address

---

## 🚀 **Features**

### 🎨 **Frontend Application**
- **🎨 3D Canvas Tool**: Intuitive design interface for creating fan art
- **🏊‍♂️ Pool Management**: Create and manage fan engagement pools
- **📝 Submission System**: Upload and display fan submissions
- **🗳️ Voting Interface**: Token-gated voting system
- **🖼️ NFT Gallery**: Display minted NFTs
- **🛒 Auction Marketplace**: Bid on and sell NFTs
- **🔗 Wallet Integration**: MetaMask connection for transactions

### 🗄️ **Database Schema**
- **🏊‍♂️ Pools**: Store pool information and deadlines
- **📝 Submissions**: Track fan submissions with metadata
- **🗳️ Votes**: Record voting history
- **🖼️ NFT Mints**: Track minted NFTs
- **🛒 Auctions**: Manage auction listings
- **💰 Bids**: Store bid history

---

## 🛠️ **Technology Stack**

<div align="center">

| Category | Technology | Purpose |
|----------|------------|---------|
| 🔗 **Smart Contracts** | Solidity 0.8.25 + OpenZeppelin | Blockchain logic |
| 🎨 **Frontend** | Next.js 15, TypeScript, Tailwind 4 | User interface |
| 🗄️ **Database** | Supabase (PostgreSQL) | Indexing on-chain events |
| 📁 **Storage** | IPFS via Pinata | Content storage |
| ⛓️ **Blockchain** | **X Layer Testnet (chainId 1952)** | Smart contract execution |
| 🎯 **Fan Tokens** | **ARG / BRA / FRA on X Layer** | Country-based gating |

</div>

---

## 📦 **Installation & Setup**

### 📋 **Prerequisites**
- Node.js 18+
- MetaMask wallet
- **ARG / BRA / FRA fan tokens (for testing)** 🎯
- **X Layer Testnet configuration**

### 🔧 **Smart Contract Setup**
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to X Layer Testnet
npx hardhat run scripts/deploy.js --network xlayer-testnet
```

### 🎨 **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 🔐 **Environment Variables**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# X Layer Testnet contracts (from deployment-addresses.json)
NEXT_PUBLIC_XLAYER_CHAIN_ID=1952
NEXT_PUBLIC_FAN_ART_CONTRACT_ADDRESS=0xf569938CdcFa89D7a77a297b399ef1F68505421C
NEXT_PUBLIC_ARG_TOKEN_ADDRESS=0x8945e2258C286fB0201DeD69bB7d9632eFC6571C
NEXT_PUBLIC_BRA_TOKEN_ADDRESS=0x0E87334cE7557A7BC8B5b692d7Cc2cB1a85F4f3A
NEXT_PUBLIC_FRA_TOKEN_ADDRESS=0xe948985DEfB690301C0Fd774bBCE3b4aeeb0CA5C

# Pinata
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY_URL=your_pinata_gateway_url
```

---

## 🎯 **Usage Guide**

### 👥 **For Fans**
1. **🔗 Connect Wallet**: Connect MetaMask with **ARG / BRA / FRA fan tokens** 🎯
2. **🏊‍♂️ Browse Pools**: View active fan engagement pools
3. **🎨 Create Content**: Use 3D canvas to design fan art
4. **📝 Submit**: Upload your creation to a pool
5. **🗳️ Vote**: Vote on other submissions (**requires country fan tokens** 🎯)
6. **🏆 Own NFTs**: Win and own minted NFTs
7. **🛒 Trade**: Buy/sell NFTs in the auction marketplace

### 👑 **For Club Owners**
1. **🏊‍♂️ Create Pools**: Set up new fan engagement campaigns
2. **⏰ Manage Deadlines**: Control submission and voting periods
3. **🏆 Mint Winners**: Convert winning designs to NFTs
4. **📊 Monitor Activity**: Track fan engagement and participation

---

## 🔐 **Security Features**

<div align="center">

| Security Feature | Description | Implementation |
|------------------|-------------|----------------|
| 🎯 **Token-Gated Access** | Minimum fan token requirements | X Layer integration |
| 👑 **Owner Controls** | Restricted pool management | OpenZeppelin Ownable |
| 🗳️ **Vote Protection** | One vote per wallet per pool | Smart contract logic |
| 🛒 **Auction Security** | Automatic bid refunds | ETH transfer handling |
| 🔒 **Access Control** | Role-based permissions | Modifier patterns |

</div>

---

## 📊 **Tokenomics**

<div align="center">

| Token | Purpose | Integration |
|-------|---------|-------------|
| **🎯 ARG / BRA / FRA Tokens** | **Voting & Bidding Access** | **X Layer Fan Tokens** |
| **⛓️ OKB** | **Auction Bidding** | **X Layer Native Currency** |
| **🏆 NFTs** | **Winner Rewards** | **ERC-721 Tokens** |

</div>

- **🎯 Country Fan Token Integration**: ARG / BRA / FRA tokens required for voting and bidding
- **⛓️ OKB for Bidding**: X Layer native currency for NFT auctions
- **🏆 Creator Rewards**: NFT ownership for winning submissions
- **📈 Fan Token Utility**: Increased demand for country fan tokens on X Layer

---

## 🌐 **Network Support**

<div align="center">

| Environment | Network | Purpose |
|-------------|---------|---------|
| 🧪 **Development** | **X Layer Testnet** | **Testing & Development** |
| 🚀 **Production** | **X Layer Mainnet** | **Live Platform** |

</div>

### 🌍 X Layer Testnet Configuration

```javascript
{
  chainId: 1952,
  chainName: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: ['https://testrpc.xlayer.tech'],
  blockExplorerUrls: ['https://www.oklink.com/xlayer-test']
}
```

Faucet: https://web3.okx.com/xlayer/faucet/xlayerfaucet

---

## 🤝 **Contributing**

<div align="center">

We welcome contributions from the community! 🎉

</div>

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✏️ Make your changes
4. 🧪 Add tests if applicable
5. 📤 Submit a pull request

---

## 📄 **License**

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

MIT License - see LICENSE file for details

</div>

---

## 🆘 **Support**

<div align="center">

| Platform | Link | Purpose |
|----------|------|---------|
| 📚 **Documentation** | [Link to docs] | Technical guides |
| 💬 **Discord** | [Community server] | Community chat |
| 🐦 **Twitter** | [@FanvasPlatform] | Updates & news |

</div>

---

## 🔮 **Roadmap**

<div align="center">

| Feature | Status | Description |
|---------|--------|-------------|
| 🏟️ **Multi-team support** | 🔄 Planned | Expand beyond 3 countries |
| 🎨 **Advanced 3D tools** | 🔄 Planned | Enhanced design features |
| 📱 **Mobile app** | 🔄 Planned | iOS & Android apps |
| 👥 **Social features** | 🔄 Planned | Community features |
| 🏛️ **Governance tokens** | 🔄 Planned | DAO governance |
| ⛓️ **Cross-chain expansion** | 🔄 Planned | Multi-chain support |

</div>

---

<div align="center">

## 🏆 **Fanvas X Cup** - Where World Cup fandom meets blockchain, on X Layer. ⚽

**Powered by X Layer + Country Fan Tokens (ARG / BRA / FRA)** 🎯

**X Layer Testnet chainId**: `1952`

</div> 