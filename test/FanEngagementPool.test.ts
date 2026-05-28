import { expect } from "chai";
import { ethers } from "hardhat";

describe("FanEngagementPool multi-token gating", () => {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();

    const Arg = await ethers.getContractFactory("ArgentinaFanToken");
    const arg = await Arg.deploy();
    const Bra = await ethers.getContractFactory("BrazilFanToken");
    const bra = await Bra.deploy();
    const Fra = await ethers.getContractFactory("FranceFanToken");
    const fra = await Fra.deploy();

    const Pool = await ethers.getContractFactory("FanEngagementPool");
    const pool = await Pool.deploy();

    await pool.addFanToken(await arg.getAddress());
    await pool.addFanToken(await bra.getAddress());
    await pool.addFanToken(await fra.getAddress());

    return { owner, alice, bob, arg, bra, fra, pool };
  }

  it("registers three tokens", async () => {
    const { pool, arg, bra, fra } = await deployFixture();
    const tokens = await pool.getFanTokens();
    expect(tokens).to.have.lengthOf(3);
    expect(tokens).to.include(await arg.getAddress());
    expect(tokens).to.include(await bra.getAddress());
    expect(tokens).to.include(await fra.getAddress());
  });

  it("rejects duplicate registration", async () => {
    const { pool, arg } = await deployFixture();
    await expect(pool.addFanToken(await arg.getAddress()))
      .to.be.revertedWith("Already approved");
  });

  it("holdsAtLeast true when user holds threshold of ANY token", async () => {
    const { pool, alice, bra } = await deployFixture();
    await bra.transfer(alice.address, ethers.parseUnits("10", 18));
    expect(await pool.holdsAtLeast(alice.address, ethers.parseUnits("10", 18))).to.equal(true);
    expect(await pool.holdsAtLeast(alice.address, ethers.parseUnits("11", 18))).to.equal(false);
  });

  it("holdsAtLeast false when user holds zero of all tokens", async () => {
    const { pool, bob } = await deployFixture();
    expect(await pool.holdsAtLeast(bob.address, ethers.parseUnits("1", 18))).to.equal(false);
  });

  it("submitToPool reverts when caller holds no fan tokens", async () => {
    const { pool, bob } = await deployFixture();
    const future = (await ethers.provider.getBlock("latest"))!.timestamp + 3600;
    await pool.createPool(0, "match-1", future, future + 3600);
    await expect(pool.connect(bob).submitToPool(1, "ipfs://x"))
      .to.be.revertedWith("Insufficient fan tokens");
  });

  it("submitToPool succeeds when caller holds threshold of one token", async () => {
    const { pool, alice, fra } = await deployFixture();
    await fra.transfer(alice.address, ethers.parseUnits("10", 18));
    const future = (await ethers.provider.getBlock("latest"))!.timestamp + 3600;
    await pool.createPool(0, "match-2", future, future + 3600);
    await expect(pool.connect(alice).submitToPool(1, "ipfs://y"))
      .to.emit(pool, "SubmissionMade");
  });
});
