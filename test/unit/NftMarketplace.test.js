const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Tests", function () {
          let nftMarketplace, BasicNft, deployer, player
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              player = (await getNamedAccounts()).player
              const accounts = await ethers.getSigners()
              player = accounts[1]
              await deployments.fixture(["all"])
              nftMarketplace = await ethers.getContract("NftMarketplace")
              nftMarketplace = await nftMarketplace.connect(player)
              BasicNft = await ethers.getContract()
              await BasicNft.mintNft()
              await BasicNft.approve(nftMarketplace.address, TOKEN_ID)
          })
          it("lists and can be bought", async function () {
              await nftMarketplace.listItem(BasicNft.address, TOKEN_ID, PRICE)
              const playerConnectedNftMarketplace = nftMarketplace.connect(player)
              await playerConnectedNftMarketplace.buyItem(BasicNft.address, TOKEN_ID, {
                  value: PRICE,
              })
              const newOwner = await BasicNft.ownerOf(TOKEN_ID)
              const deployerProceeds = await nftMarketplace.getProceeds(deployer)
              assert(newOwner.toString() == player)
              assert(deployerProceeds.toString() == PRICE.toString())
          })
      })
