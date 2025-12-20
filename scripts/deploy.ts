import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying TipJar contract...");
  console.log("Deployer address:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  // Protocol fee recipient - use deployer for MVP, change for production
  const protocolFeeRecipient = process.env.PROTOCOL_FEE_RECIPIENT || deployer.address;
  
  console.log("Protocol fee recipient:", protocolFeeRecipient);
  
  const TipJar = await ethers.getContractFactory("TipJar");
  const tipJar = await TipJar.deploy(protocolFeeRecipient);
  
  await tipJar.waitForDeployment();
  
  const address = await tipJar.getAddress();
  
  console.log("\n✅ TipJar deployed successfully!");
  console.log("Contract address:", address);
  console.log("\nVerify on Basescan:");
  console.log(`npx hardhat verify --network base ${address} ${protocolFeeRecipient}`);
  
  // Write deployment info to file
  const deploymentInfo = {
    address,
    protocolFeeRecipient,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
  };
  
  console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
