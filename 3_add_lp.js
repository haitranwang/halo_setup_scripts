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
    chainConfig.denom,
    chainConfig.cw20Tokens.MSTR,
];
// Example: chainConfig.cw20Tokens.BUSD
let asset2AddressList = [
    chainConfig.cw20Tokens.MSTR,
    chainConfig.cw20Tokens.BUSD,
];
// Assets info list
// Example: C98
let asset1AddressName = [
    chainConfig.denom,
    "MSTR",

];
// Example: C98
let asset2AddressName = [
    "MSTR",
    "BUSD",
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

    // // Query pair contract address
    // const pairContractAddressQueryMsg = {
    //     "pair": {
    //         "asset_infos": [
    //             {
    //                 "native_token": {
    //                     "denom": chainConfig.denom,
    //                 }
    //             },
    //             {
    //                 "token": {
    //                     "contract_addr": chainConfig.cw20Tokens.BUSD,
    //                 }
    //             },
    //         ]
    //     }
    // }

    // // Query pair contract address
    // let pairContractAddressQueryResponse = await query(deployerClient, haloFactoryAddress, pairContractAddressQueryMsg);
    // // Print out the result
    // console.log("pairContractAddressQueryResponse: ", pairContractAddressQueryResponse.contract_addr);

    // // Increase allowance
    // const increaseAllowanceExecuteMsg = {
    //     "increase_allowance": {
    //         "spender": pairContractAddressQueryResponse.contract_addr,
    //         "amount": "1000000000000000000",
    //     }
    // }

    // // execute contract
    // let increaseAllowanceExecuteResponse = await execute(deployerClient, deployerAccount, chainConfig.cw20Tokens.BUSD, increaseAllowanceExecuteMsg, 1000000);

    // // Print out the result
    // console.log("increaseAllowanceExecuteResponse transactionHash: ", increaseAllowanceExecuteResponse.transactionHash);

    // // Provide liquidity
    // const provideLiquidityExecuteMsg = {
    //     "provide_liquidity": {
    //         "assets": [
    //             {
    //                 "info": {
    //                     "native_token": {
    //                         "denom": chainConfig.denom,
    //                     }
    //                 },
    //                 "amount": "1000000",
    //             },
    //             {
    //                 "info": {
    //                     "token": {
    //                         "contract_addr": chainConfig.cw20Tokens.BUSD,
    //                     }
    //                 },
    //                 "amount": "1000000000000000000",
    //             }
    //         ],
    //     }
    // }

    // // execute contract
    // let provideLiquidityExecuteResponse = await execute(deployerClient, deployerAccount, pairContractAddressQueryResponse.contract_addr, provideLiquidityExecuteMsg, 1000000);
    // // Print out the result
    // console.log("provide liquidity transactionHash: ", provideLiquidityExecuteResponse.transactionHash);

    // Provide liquidity for the pair base on asset1AddressList and asset2AddressList
    for (let i = 0; i < asset1AddressList.length; i++) {
        if (asset1AddressName[i] != chainConfig.denom && asset2AddressName[i] != chainConfig.denom) {
            // Query pair contract address
            const pairContractAddressQueryMsg = {
            "pair": {
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
                    ]
                }
            }

            // Query pair contract address
            let pairContractAddressQueryResponse = await query(deployerClient, haloFactoryAddress, pairContractAddressQueryMsg);
            // Print out the result
            console.log("pairContractAddressQueryResponse1: ", pairContractAddressQueryResponse.contract_addr);

            // Increase allowance
            const increaseAllowanceExecuteMsg = {
                "increase_allowance": {
                "spender": pairContractAddressQueryResponse.contract_addr,
                "amount": "1000000000000000000",
                }
            }

            // execute contract
            let increaseAllowanceExecuteResponse1 = await execute(deployerClient, deployerAccount, asset1AddressList[i], increaseAllowanceExecuteMsg, 10);
            // Print out the result
            console.log("increaseAllowanceExecuteResponse transactionHash: ", increaseAllowanceExecuteResponse1.transactionHash);

            // Increase allowance
            const increaseAllowanceExecuteMsg2 = {
                "increase_allowance": {
                "spender": pairContractAddressQueryResponse.contract_addr,
                "amount": "1000000000000000000",
                }
            }

            // execute contract
            let increaseAllowanceExecuteResponse2 = await execute(deployerClient, deployerAccount, asset2AddressList[i], increaseAllowanceExecuteMsg2, 10);
            // Print out the result
            console.log("increaseAllowanceExecuteResponse transactionHash: ", increaseAllowanceExecuteResponse2.transactionHash);
            // Provide liquidity
            const provideLiquidityExecuteMsg = {
                "provide_liquidity": {
                    "assets": [
                        {
                            "info": {
                                "token": {
                                    "contract_addr": asset1AddressList[i],
                                }
                            },
                            "amount": "1000000000000000000",
                        },
                        {
                            "info": {
                                "token": {
                                    "contract_addr": asset2AddressList[i],
                                }
                            },
                            "amount": "1000000000000000000",
                        }
                    ],
                }
            }
            // execute contract
            let provideLiquidityExecuteResponse = await execute(deployerClient, deployerAccount, pairContractAddressQueryResponse.contract_addr, provideLiquidityExecuteMsg, 10);
            // Print out the result
            console.log("provide liquidity transactionHash: ", provideLiquidityExecuteResponse.transactionHash);
        } else if (asset1AddressName[i] == chainConfig.denom && asset2AddressName[i] != chainConfig.denom) {
            // Query pair contract address
            const pairContractAddressQueryMsg2 = {
                "pair": {
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
                        ]
                    }
                }

                // Query pair contract address
                let pairContractAddressQueryResponse2 = await query(deployerClient, haloFactoryAddress, pairContractAddressQueryMsg2);
                // Print out the result
                console.log("pairContractAddressQueryResponse2: ", pairContractAddressQueryResponse2.contract_addr);

                // Increase allowance
                const increaseAllowanceExecuteMsg2 = {
                    "increase_allowance": {
                    "spender": pairContractAddressQueryResponse2.contract_addr,
                    "amount": "1000000000000000000",
                    }
                }

            // execute contract
            let increaseAllowanceExecuteResponse2 = await execute(deployerClient, deployerAccount, asset2AddressList[i], increaseAllowanceExecuteMsg2, 10);
            // Print out the result
            console.log("increaseAllowanceExecuteResponse transactionHash: ", increaseAllowanceExecuteResponse2.transactionHash);

            // Provide liquidity
            const provideLiquidityExecuteMsg = {
                "provide_liquidity": {
                    "assets": [
                        {
                            "info": {
                                "native_token": {
                                    "denom": chainConfig.denom,
                                }
                            },
                            "amount": "100000",
                        },
                        {
                            "info": {
                                "token": {
                                    "contract_addr": asset2AddressList[i],
                                }
                            },
                            "amount": "1000000000000000000",
                        }
                    ],
                }
            }
            // execute contract
            let provideLiquidityExecuteResponse = await execute(deployerClient, deployerAccount, pairContractAddressQueryResponse2.contract_addr, provideLiquidityExecuteMsg, 100000);
            // Print out the result
            console.log("provide liquidity transactionHash: ", provideLiquidityExecuteResponse.transactionHash);
        } else if (asset1AddressName[i] != chainConfig.denom && asset2AddressName[i] == chainConfig.denom) {
            // Query pair contract address
            const pairContractAddressQueryMsg1 = {
                "pair": {
                    "asset_infos": [
                            {
                                "native_token": {
                                    "denom": chainConfig.denom,
                                }
                            },
                            {
                                "token": {
                                    "contract_addr": asset1AddressList[i],
                                }
                            },
                        ]
                    }
                }

                // Query pair contract address
                let pairContractAddressQueryResponse1 = await query(deployerClient, haloFactoryAddress, pairContractAddressQueryMsg1);
                // Print out the result
                console.log("pairContractAddressQueryResponse1: ", pairContractAddressQueryResponse1.contract_addr);

                // Increase allowance
                const increaseAllowanceExecuteMsg1 = {
                    "increase_allowance": {
                    "spender": pairContractAddressQueryResponse1.contract_addr,
                    "amount": "1000000000000000000",
                    }
                }

                // execute contract
                let increaseAllowanceExecuteResponse1 = await execute(deployerClient, deployerAccount, asset1AddressList[i], increaseAllowanceExecuteMsg1, 10);
                // Print out the result
                console.log("increaseAllowanceExecuteResponse transactionHash: ", increaseAllowanceExecuteResponse1.transactionHash);
            // Provide liquidity
            const provideLiquidityExecuteMsg = {
                "provide_liquidity": {
                    "assets": [
                        {
                            "info": {
                                "token": {
                                    "contract_addr": asset1AddressList[i],
                                }
                            },
                            "amount": "1000000000000000000",
                        },
                        {
                            "info": {
                                "native_token": {
                                    "denom": chainConfig.denom,
                                }
                            },
                            "amount": "100000",
                        }
                    ],
                }
            }
            // execute contract
            let provideLiquidityExecuteResponse = await execute(deployerClient, deployerAccount, pairContractAddressQueryResponse1.contract_addr, provideLiquidityExecuteMsg, 100000);
            // Print out the result
            console.log("provide liquidity transactionHash: ", provideLiquidityExecuteResponse.transactionHash);
        }
    }
}

const myArgs = process.argv.slice(2);
// if (myArgs.length != 1) {
//     console.log("Usage: node 0_launchpad_setup.js <wasm_contract_name>");
//     process.exit(1);
// }
main();