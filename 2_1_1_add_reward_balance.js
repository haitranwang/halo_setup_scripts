// Get time stamp
// https://bytetool.web.app/en/unix/
const chainConfig = require("./config/chain").defaultChain;
// Halo Farming Pool contract address
const haloFarmingPoolAddress = "aura1ee3psnlzzz55usq2fn93yvyknv3u8z4yrry75fvvwz9lgfmcf66qm0yewa";

const fs = require("fs");

const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");
const { DirectSecp256k1HdWallet, coin } = require("@cosmjs/proto-signing");
const { calculateFee, GasPrice } = require("@cosmjs/stargate");

// gas price
const gasPrice = GasPrice.fromString(`0.025${chainConfig.denom}`);
// tester and deployer info
let testerWallet, testerClient, testerAccount;
let deployerWallet, deployerClient, deployerAccount;

// Wallet address
const ADMIN = "aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n";
// Assets info list
// Example: chainConfig.cw20Tokens.C98
let asset1AddressList = [
    // chainConfig.cw20Tokens.SFTY,
    chainConfig.ibcTokens.USDC,
];
// Example: chainConfig.cw20Tokens.BUSD or chainConfig.ibcTokens.USDC,
let asset2AddressList = [
    // chainConfig.denom,
    chainConfig.cw20Tokens.SFTY,
];


/// @dev Execute a message to the contract
/// @param `userClient` - The client of the user who execute the message
/// @param `userAccount` -  The account of the user who execute the message
/// @param `contract` - The address of the contract
/// @param `executeMsg` - The message that will be executed
/// @return `executeResponse` - The response of the execute transaction
async function execute(
    userClient,
    userAccount,
    contract,
    executeMsg,
    native_amount = 0,
    native_denom = chainConfig.denom
) {
    console.log("Executing message to contract...");

    const memo = "execute a message";

    let executeResponse;

    // if the native amount is not 0, then send the native token to the contract
    if (native_amount != 0) {
        executeResponse = await userClient.execute(
            userAccount.address,
            contract,
            executeMsg,
            "auto",
            memo,
            [coin(native_amount, native_denom)]
        );
    } else {
        executeResponse = await userClient.execute(
            userAccount.address,
            contract,
            executeMsg,
            "auto",
            memo
        );
    }

    console.log("  transactionHash: ", executeResponse.transactionHash);
    console.log(
        "  gasWanted / gasUsed: ",
        executeResponse.gasWanted,
        " / ",
        executeResponse.gasUsed
    );

    return executeResponse;
}

async function main(contract_name) {
    // ***************************
    // SETUP INFORMATION FOR USERS
    // ***************************
    // connect deployer wallet to chain and get admin account
    deployerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.deployer_mnemonic,
        {
            prefix: chainConfig.prefix,
        }
    );
    deployerClient = await SigningCosmWasmClient.connectWithSigner(
        chainConfig.rpcEndpoint,
        deployerWallet,
        { gasPrice }
    );
    deployerAccount = (await deployerWallet.getAccounts())[0];

    // ****************
    // EXECUTE CONTRACT
    // ****************
    // store contract

    // Create pool


    console.log("Adding reward balance...");

    // ***************************
    const addRewardBalanceMsg = {
        add_reward_balance: {
            asset: {
                info: {
                    native_token: {
                        denom: chainConfig.denom,
                    },
                },
                amount: "70000000",
            },
        },
    }


    // execute add reward balance message
    let addRewardBalanceResponse = await execute(
        deployerClient,
        deployerAccount,
        haloFarmingPoolAddress,
        addRewardBalanceMsg,
        70000000,
        chainConfig.denom,
    );

    console.log("Adding reward balance completed!");
    console.log("transactionHash: ", addRewardBalanceResponse.transactionHash);
}

const myArgs = process.argv.slice(2);
// if (myArgs.length != 1) {
//     console.log("Usage: node 0_launchpad_setup.js <wasm_contract_name>");
//     process.exit(1);
// }
main();
