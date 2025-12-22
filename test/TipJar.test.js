const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipJar", function () {
  let tipJar;
  let owner;
  let creator;
  let tipper1;
  let tipper2;
  let protocolFeeRecipient;

  const PROTOCOL_FEE_BPS = 200; // 2%
  const BPS_DENOMINATOR = 10000;
  const MIN_TIP_AMOUNT = ethers.parseEther("0.0001");

  beforeEach(async function () {
    [owner, creator, tipper1, tipper2, protocolFeeRecipient] = await ethers.getSigners();

    const TipJar = await ethers.getContractFactory("TipJar");
    tipJar = await TipJar.deploy(protocolFeeRecipient.address);
    await tipJar.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct protocol fee recipient", async function () {
      expect(await tipJar.protocolFeeRecipient()).to.equal(protocolFeeRecipient.address);
    });

    it("Should initialize counters to zero", async function () {
      expect(await tipJar.globalTipCount()).to.equal(0);
    });

    it("Should revert with invalid recipient", async function () {
      const TipJar = await ethers.getContractFactory("TipJar");
      await expect(TipJar.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        TipJar, "InvalidRecipient"
      );
    });
  });

  describe("Tipping", function () {
    it("Should accept a valid tip", async function () {
      const tipAmount = ethers.parseEther("0.01");

      // Send tip
      const tx = await tipJar.connect(tipper1).tip(creator.address, { value: tipAmount });
      await tx.wait();

      // Check contract state
      expect(await tipJar.globalTipCount()).to.equal(1);
      const [totalTips, tipCount] = await tipJar.getCreatorStats(creator.address);
      expect(totalTips).to.equal(tipAmount);
      expect(tipCount).to.equal(1);
    });

    it("Should reject tip below minimum amount", async function () {
      const smallAmount = ethers.parseEther("0.00001"); // Below minimum

      await expect(
        tipJar.connect(tipper1).tip(creator.address, { value: smallAmount })
      ).to.be.revertedWithCustomError(tipJar, "TipTooSmall");
    });

    it("Should reject tip to zero address", async function () {
      const tipAmount = ethers.parseEther("0.01");

      await expect(
        tipJar.connect(tipper1).tip(ethers.ZeroAddress, { value: tipAmount })
      ).to.be.revertedWithCustomError(tipJar, "InvalidRecipient");
    });

    it("Should handle multiple tips to same creator", async function () {
      const tipAmount1 = ethers.parseEther("0.01");
      const tipAmount2 = ethers.parseEther("0.02");

      // First tip
      await tipJar.connect(tipper1).tip(creator.address, { value: tipAmount1 });
      // Second tip
      await tipJar.connect(tipper2).tip(creator.address, { value: tipAmount2 });

      // Check totals
      const [totalTips, tipCount] = await tipJar.getCreatorStats(creator.address);
      expect(totalTips).to.equal(tipAmount1 + tipAmount2);
      expect(tipCount).to.equal(2);
      expect(await tipJar.globalTipCount()).to.equal(2);
    });

    it("Should handle tips to different creators", async function () {
      const tipAmount = ethers.parseEther("0.01");

      await tipJar.connect(tipper1).tip(creator.address, { value: tipAmount });
      await tipJar.connect(tipper1).tip(tipper2.address, { value: tipAmount });

      // Check creator stats
      const [creatorTotal, creatorCount] = await tipJar.getCreatorStats(creator.address);
      const [anotherTotal, anotherCount] = await tipJar.getCreatorStats(tipper2.address);

      expect(creatorTotal).to.equal(tipAmount);
      expect(creatorCount).to.equal(1);
      expect(anotherTotal).to.equal(tipAmount);
      expect(anotherCount).to.equal(1);
      expect(await tipJar.globalTipCount()).to.equal(2);
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate fees correctly", async function () {
      const testAmounts = [
        ethers.parseEther("0.01"),   // 0.01 ETH
        ethers.parseEther("0.1"),    // 0.1 ETH
        ethers.parseEther("1"),      // 1 ETH
        ethers.parseEther("10"),     // 10 ETH
      ];

      for (const amount of testAmounts) {
        const [expectedFee, expectedCreatorAmount] = await tipJar.calculateFee(amount);
        const actualFee = (amount * BigInt(PROTOCOL_FEE_BPS)) / BigInt(BPS_DENOMINATOR);
        const actualCreatorAmount = amount - actualFee;

        expect(expectedFee).to.equal(actualFee);
        expect(expectedCreatorAmount).to.equal(actualCreatorAmount);
        expect(expectedFee + expectedCreatorAmount).to.equal(amount);
      }
    });

    it("Should handle minimum amount", async function () {
      const minAmount = MIN_TIP_AMOUNT;
      const [fee, creatorAmount] = await tipJar.calculateFee(minAmount);
      expect(fee + creatorAmount).to.equal(minAmount);
    });
  });

  describe("Creator Stats", function () {
    it("Should return correct stats for creator with tips", async function () {
      const tipAmount1 = ethers.parseEther("0.01");
      const tipAmount2 = ethers.parseEther("0.02");

      await tipJar.connect(tipper1).tip(creator.address, { value: tipAmount1 });
      await tipJar.connect(tipper2).tip(creator.address, { value: tipAmount2 });

      const [totalTips, tipCount] = await tipJar.getCreatorStats(creator.address);

      expect(totalTips).to.equal(tipAmount1 + tipAmount2);
      expect(tipCount).to.equal(2);
    });

    it("Should return zero stats for creator with no tips", async function () {
      const [totalTips, tipCount] = await tipJar.getCreatorStats(creator.address);

      expect(totalTips).to.equal(0);
      expect(tipCount).to.equal(0);
    });
  });

  describe("Constants", function () {
    it("Should have correct protocol fee", async function () {
      expect(await tipJar.PROTOCOL_FEE_BPS()).to.equal(PROTOCOL_FEE_BPS);
    });

    it("Should have correct BPS denominator", async function () {
      expect(await tipJar.BPS_DENOMINATOR()).to.equal(BPS_DENOMINATOR);
    });

    it("Should have correct minimum tip amount", async function () {
      expect(await tipJar.MIN_TIP_AMOUNT()).to.equal(MIN_TIP_AMOUNT);
    });
  });

  describe("Events", function () {
    it("Should emit TipSent event", async function () {
      const tipAmount = ethers.parseEther("0.01");

      await expect(tipJar.connect(tipper1).tip(creator.address, { value: tipAmount }))
        .to.emit(tipJar, "TipSent");
    });

    it("Should emit TipMessage event for tips with messages", async function () {
      const tipAmount = ethers.parseEther("0.01");
      const message = "Great work!";

      await expect(
        tipJar.connect(tipper1).tipWithMessage(creator.address, message, { value: tipAmount })
      ).to.emit(tipJar, "TipMessage");
    });
  });
});
