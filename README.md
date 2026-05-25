# 🎨 Fanvas – Democratizing Fan Art, On-Chain

<div align="center">

![Fanvas Logo](https://img.shields.io/badge/Fanvas-Democratizing%20Fan%20Art-blue?style=for-the-badge&logo=ethereum)
![Chiliz Integration](https://img.shields.io/badge/Chiliz-Powered%20by%20Fan%20Tokens-green?style=for-the-badge&logo=chiliz)
![Blockchain](https://img.shields.io/badge/Blockchain-Chiliz%20Spicy%20Testnet-orange?style=for-the-badge&logo=chiliz)

**Where fandom meets blockchain, and creativity becomes legacy** 🏆⚽

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)

</div>

---

## 🌟 **Powered by Chiliz Fan Tokens** 🌟

<div align="center">

![Chiliz Integration](https://img.shields.io/badge/PSG%20Tokens-Required%20for%20Voting%20%26%20Bidding-brightgreen?style=for-the-badge)
![Fan Engagement](https://img.shields.io/badge/Fan%20Engagement-Token%20Gated%20Access-blue?style=for-the-badge)
![PSG Contract](https://img.shields.io/badge/PSG%20Contract-0xC1771089870D3dDF8174775ed12D09Ff8DeCc550-purple?style=for-the-badge)

</div>

**Fanvas** is a revolutionary blockchain-powered platform that lets fans design, vote, and own official club visuals — **all powered by Chiliz fan tokens**.

Supporters can create **Tifos**, **Jerseys**, **Posters**, **Matchday Tickets**, and **Stadium Banners** using our in-app 3D canvas tool — an intuitive board where anyone can unleash creativity, even without prior design experience.

---

## 🚀 **What makes Fanvas revolutionary?**

<div align="center">

| Feature | Description | Chiliz Integration |
|---------|-------------|-------------------|
| 🗳️ **Decentralized Voting** | Token-gated voting system | Requires PSG tokens to vote |
| 🏆 **NFT Minting** | Winners get minted as NFTs | Fan token holders shape outcomes |
| 💰 **Fan-Only Auctions** | Exclusive bidding for token holders | PSG tokens required to bid |

</div>

### 🎯 **Key Innovations**

- **🗳️ Decentralized & Token-Gated Voting**: Only fans holding a minimum number of club fan tokens (e.g., **PSG tokens on Chiliz**) can vote on the best designs — ensuring that real fans shape the club's visuals, not just a central team.

- **🏆 NFT Minting for Winners**: Top-voted designs are minted as NFTs. Imagine seeing your fan-designed Tifo at a legendary match, and owning it digitally forever. These moments are captured as NFTs and tied to their creators — **your fandom becomes your legacy**.

- **💰 Fan-Only Auctions**: Once minted, the winning NFTs are listed for auction. Bidding requires a minimum fan token balance, making sure it's **fans supporting fans** — using Chiliz (CHZ) as the currency.

> **Fanvas isn't just a platform — it's a movement to democratize fan-driven creativity, giving real supporters a say in how their club looks and feels.**

By bridging fan culture with Web3, Fanvas creates emotional and economic value, incentivizing creativity, and **expanding utility for fan tokens** — all while fueling the growth of the **Chiliz ecosystem**.

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
    uint256 requiredPsgTokens;  // 🎯 Chiliz Integration
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
   - **Requires minimum 10 PSG tokens balance** 🎯
   - Content URL points to IPFS/metadata
   - Emits `SubmissionMade` event

##### **🗳️ Voting System**

4. **`vote(uint256, uint256)`** - *Token-Gated*
   - Allows fans to vote on submissions
   - **Requires minimum 10 PSG tokens balance** 🎯
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
   - Sets minimum bid and **required PSG tokens for bidders** 🎯
   - Only NFT owner can create auction
   - Emits `AuctionCreated` event

7. **`placeBid(uint256)`** - *Payable*
   - Allows fans to bid on NFTs
   - **Requires minimum PSG token balance** 🎯
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
| 🔗 **Smart Contracts** | Solidity, OpenZeppelin | Blockchain logic |
| 🎨 **Frontend** | Next.js, TypeScript, Tailwind CSS | User interface |
| 🗄️ **Database** | Supabase (PostgreSQL) | Data storage |
| 📁 **Storage** | IPFS via Pinata | Content storage |
| ⛓️ **Blockchain** | **Chiliz Spicy Testnet** | **Smart contract execution** |
| 🎯 **Fan Tokens** | **PSG Token (0xC1771089870D3dDF8174775ed12D09Ff8DeCc550)** | **Token-gated access** |

</div>

---

## 📦 **Installation & Setup**

### 📋 **Prerequisites**
- Node.js 18+
- MetaMask wallet
- **PSG tokens (for testing)** 🎯
- **Chiliz Spicy testnet configuration**

### 🔧 **Smart Contract Setup**
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Chiliz Spicy testnet
npx hardhat run scripts/deploy.js --network chiliz-spicy
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

# Contract
NEXT_PUBLIC_FAN_ART_CONTRACT_ADDRESS=your_contract_address

# Chiliz Configuration
NEXT_PUBLIC_CHILIZ_NETWORK_ID=88882
NEXT_PUBLIC_PSG_TOKEN_ADDRESS=0xC1771089870D3dDF8174775ed12D09Ff8DeCc550

# Pinata
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY_URL=your_pinata_gateway_url
```

---

## 🎯 **Usage Guide**

### 👥 **For Fans**
1. **🔗 Connect Wallet**: Connect MetaMask with **PSG tokens** 🎯
2. **🏊‍♂️ Browse Pools**: View active fan engagement pools
3. **🎨 Create Content**: Use 3D canvas to design fan art
4. **📝 Submit**: Upload your creation to a pool
5. **🗳️ Vote**: Vote on other submissions (**requires PSG tokens** 🎯)
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
| 🎯 **Token-Gated Access** | Minimum PSG token requirements | Chiliz integration |
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
| **🎯 PSG Tokens** | **Voting & Bidding Access** | **Chiliz Fan Tokens** |
| **⛓️ CHZ** | **Auction Bidding** | **Chiliz Native Currency** |
| **🏆 NFTs** | **Winner Rewards** | **ERC-721 Tokens** |

</div>

- **🎯 PSG Token Integration**: Required for voting and bidding
- **⛓️ CHZ for Bidding**: Chiliz native currency for NFT auctions
- **🏆 Creator Rewards**: NFT ownership for winning submissions
- **📈 Fan Token Utility**: Increased demand for PSG tokens

---

## 🌐 **Network Support**

<div align="center">

| Environment | Network | Purpose |
|-------------|---------|---------|
| 🧪 **Development** | **Chiliz Spicy Testnet** | **Testing & Development** |
| 🚀 **Production** | **Chiliz Mainnet** | **Live Platform** |

</div>

### **🌶️ Chiliz Spicy Testnet Configuration**
```javascript
// Network Configuration
{
  chainId: 88882,
  chainName: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18
  },
  rpcUrls: ['https://spicy-rpc.chiliz.com'],
  blockExplorerUrls: ['https://spicy-explorer.chiliz.com']
}
```

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
| 🏟️ **Multi-club support** | 🔄 Planned | Expand beyond PSG |
| 🎨 **Advanced 3D tools** | 🔄 Planned | Enhanced design features |
| 📱 **Mobile app** | 🔄 Planned | iOS & Android apps |
| 👥 **Social features** | 🔄 Planned | Community features |
| 🏛️ **Governance tokens** | 🔄 Planned | DAO governance |
| ⛓️ **Cross-chain expansion** | 🔄 Planned | Multi-chain support |

</div>

---

<div align="center">

## 🏆 **Fanvas** - Where fandom meets blockchain, and creativity becomes legacy. ⚽

**Powered by Chiliz Fan Tokens** 🎯

**PSG Token Contract**: `0xC1771089870D3dDF8174775ed12D09Ff8DeCc550`

</div> 