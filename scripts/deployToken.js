const fs = require("fs");
const { promisify } = require("util");

async function main() {
    const [owner, signer2] = await ethers.getSigners();
  
    Shoaib = await ethers.getContractFactory("Shoaib");
    shoaib = await Shoaib.deploy();
    await shoaib.deployTransaction.wait()
  
    Rayyan = await ethers.getContractFactory("Rayyan");
    rayyan = await Rayyan.deploy();
    await rayyan.deployTransaction.wait()
  
    PopUp = await ethers.getContractFactory("PopUp");
    popUp = await PopUp.deploy();
    await popUp.deployTransaction.wait()
  
    console.log("shoaibAddress=", `'${shoaib.address}'`);
    console.log("rayyanAddrss=", `'${rayyan.address}'`);
    console.log("popUpAddress=", `'${popUp.address}'`);


    let addresses = [
      `shoaibAddress=${shoaib.address}`,
      `rayyanAddrss=${rayyan.address}`,
      `popUpAddress=${popUp.address}`,
    ];
    const data = "\n" + addresses.join("\n");
  
    const writeFile = promisify(fs.appendFile);
    const filePath = ".env";
    return writeFile(filePath, data)
      .then(() => {
        console.log("Addresses recorded.");
      })
      .catch((error) => {
        console.error("Error logging addresses:", error);
        throw error;
      });

  }


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });