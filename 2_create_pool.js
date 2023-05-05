const chainConfig = require('./config/chain').defaultChain;

const fs = require('fs');

const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet, coin } = require('@cosmjs/proto-signing');
const { calculateFee, GasPrice } = require('@cosmjs/stargate');

// gas price
const gasPrice = GasPrice.fromString(`0.025${chainConfig.denom}`);
// tester and deployer info
let testerWallet, testerClient, testerAccount;
let deployerWallet, deployerClient, deployerAccount;

// Halo Factory contract address
let haloFactoryAddress = "aura1ayqkpcknd72nec39gn7884p6lddljzns0yle6zll47lw38xa3j5sdnfk3u";
// Halo Router contract address
let haloRouterAddress = "aura1m8y4h8vq8ygk3gn29xz07kee004f02pxgr3kk28hnj92aj3vjqpss3pwdc";

// Wallet address
const ADMIN = "aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n";
// Assets info list
// Example: chainConfig.cw20Tokens.C98
let asset1AddressList = [
    chainConfig.denom
];
// Example: chainConfig.cw20Tokens.BUSD
let asset2AddressList = [
    chainConfig.cw20Tokens.MSTR,
];
// Assets info list
// Example: C98
let asset1AddressName = [
    chainConfig.denom,
];
// Example: C98
let asset2AddressName = [
    "MSTR"
];

/// @dev Execute a message to the contract
/// @param `userClient` - The client of the user who execute the message
/// @param `userAccount` -  The account of the user who execute the message
/// @param `contract` - The address of the contract
/// @param `executeMsg` - The message that will be executed
/// @return `executeResponse` - The response of the execute transaction
async function execute(userClient, userAccount, contract, executeMsg, native_amount = 0, native_denom = chainConfig.denom) {
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
            [coin(native_amount, native_denom)],
        );
    } else {
        executeResponse = await userClient.execute(
            userAccount.address,
            contract,
            executeMsg,
            "auto",
            memo,
        );
    }


    console.log("  transactionHash: ", executeResponse.transactionHash);
    console.log("  gasWanted / gasUsed: ", executeResponse.gasWanted, " / ", executeResponse.gasUsed);

    return executeResponse;
}

/// @dev Query information from the contract
/// @param `userClient` - The client of the user who execute the message
/// @param `contract` - The address of the contract
/// @param `queryMsg` - The message that will be executed
/// @return `queryResponse` - The response of the query
async function query(userClient, contract, queryMsg) {
    console.log("Querying contract...");

    const queryResponse = await userClient.queryContractSmart(contract, queryMsg);

    console.log("  Querying successful");

    return queryResponse;
}

async function main(contract_name) {
    // ***************************
    // SETUP INFORMATION FOR USERS
    // ***************************
    // connect deployer wallet to chain and get admin account
    deployerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.deployer_mnemonic,
        {
            prefix: chainConfig.prefix
        }
    );
    deployerClient = await SigningCosmWasmClient.connectWithSigner(chainConfig.rpcEndpoint, deployerWallet, {gasPrice});
    deployerAccount = (await deployerWallet.getAccounts())[0];

    // ****************
    // EXECUTE CONTRACT
    // ****************
    // store contract

    // Create pair EAURA - BUSD

    // Add Native Token Decimals
    const addNativeTokenDecimalsMsg = {
        "add_native_token_decimals": {
            "denom": chainConfig.denom,
            "decimals": 6
        }
    }
    console.log("Creating pairs...");

    // execute contract
    let addNativeTokenDecimalsResponse = await execute(deployerClient, deployerAccount, haloFactoryAddress, addNativeTokenDecimalsMsg, 100);
    // Print out the result
    console.log("add Native Token transactionHash: ", addNativeTokenDecimalsResponse.transactionHash);


    // Create pair base on asset1AddressList and asset2AddressList
    for (let i = 0; i < asset1AddressList.length; i++) {
        // Create pair
        if (asset1AddressName[i] != chainConfig.denom && asset1AddressName[i] != chainConfig.denom) {
            const createPairExecuteMsg = {
                "create_pair": {
                    "asset_infos": [
                        {
                            "token": {
                                "contract_addr": asset1AddressList[i],
                            }
                        },
                        {
                            "token": {
                                "contract_addr": asset2AddressList[i],
                            }
                        },
                    ],
                    "requirements": {
                        "whitelist": [ADMIN],
                        "first_asset_minimum": "0",
                        "second_asset_minimum": "0",
                    },
                    "commission_rate": "0.003",
                    "lp_token_info": {
                        "lp_token_name": asset1AddressName[i] + "_" + asset2AddressName[i] + "_LP",
                        "lp_token_symbol": asset1AddressName[i] + "_" + asset2AddressName[i] + "_LP",
                        "lp_token_decimals": 6
                    }
                }
            }
            // execute contract
            let createPairExecuteResponse = await execute(deployerClient, deployerAccount, haloFactoryAddress, createPairExecuteMsg, 1);
            console.log("create pair transactionHash: ", createPairExecuteResponse.transactionHash);
        }
        else if (asset1AddressList[i] == chainConfig.denom && asset2AddressList[i] != chainConfig.denom) {
            const createPairExecuteMsg = {
                "create_pair": {
                    "asset_infos": [
                        {
                            "native_token": {
                                "denom": chainConfig.denom,
                            }
                        },
                        {
                            "token": {
                                "contract_addr": asset2AddressList[i],
                            }
                        },
                    ],
                    "requirements": {
                        "whitelist": [ADMIN],
                        "first_asset_minimum": "0",
                        "second_asset_minimum": "0",
                    },
                    "commission_rate": "0.003",
                    "lp_token_info": {
                        "lp_token_name": chainConfig.denom + "_" + asset2AddressName[i] + "_LP",
                        "lp_token_symbol": chainConfig.denom + "_" + asset2AddressName[i] + "_LP",
                        "lp_token_decimals": 6
                    }
                }
            }
            // execute contract
            let createPairExecuteResponse = await execute(deployerClient, deployerAccount, haloFactoryAddress, createPairExecuteMsg, 1);
            console.log("create pair transactionHash: ", createPairExecuteResponse.transactionHash);
        }
        else if (asset1AddressList[i] != chainConfig.denom && asset2AddressList[i] == chainConfig.denom) {
            const createPairExecuteMsg = {
                "create_pair": {
                    "asset_infos": [
                        {
                            "token": {
                                "contract_addr": asset1AddressList[i],
                            }
                        },
                        {
                            "native_token": {
                                "denom": chainConfig.denom,
                            }
                        },
                    ],
                    "requirements": {
                        "whitelist": [ADMIN],
                        "first_asset_minimum": "0",
                        "second_asset_minimum": "0",
                    },
                    "commission_rate": "0.003",
                    "lp_token_info": {
                    "lp_token_name": asset1AddressName[i] + "_" + chainConfig.denom + "_LP",
                    "lp_token_symbol": asset1AddressName[i] + "_" + chainConfig.denom + "_LP",
                    "lp_token_decimals": 6
                    }
                }
            }
            // execute contract
            let createPairExecuteResponse = await execute(deployerClient, deployerAccount, haloFactoryAddress, createPairExecuteMsg, 1);
            console.log("create pair transactionHash: ", createPairExecuteResponse.transactionHash);
        }
    }

    console.log("Create pair completed!");
}

const myArgs = process.argv.slice(2);
// if (myArgs.length != 1) {
//     console.log("Usage: node 0_launchpad_setup.js <wasm_contract_name>");
//     process.exit(1);
// }
main();
