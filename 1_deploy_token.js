const chainConfig = require("./config/chain").defaultChain;

const fs = require("fs");

const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");
const { DirectSecp256k1HdWallet, coin } = require("@cosmjs/proto-signing");
const { calculateFee, GasPrice } = require("@cosmjs/stargate");

// wasm folder
const wasmFolder = `${__dirname}/artifacts`;

// gas price
const gasPrice = GasPrice.fromString(`0.025${chainConfig.denom}`);
// tester and deployer info
let testerWallet, testerClient, testerAccount;
let deployerWallet, deployerClient, deployerAccount;

/// @dev Store the contract source code on chain
/// @param `wasm_name` - The name of the wasm file
/// @return `storeCodeResponse` - The response of the store code transaction
async function store_contract(wasm_name) {
    const uploadFee = calculateFee(2600000, gasPrice);
    const contractCode = fs.readFileSync(`${wasmFolder}/${wasm_name}.wasm`);

    console.log("Uploading contract code...");
    const storeCodeResponse = await deployerClient.upload(
        deployerAccount.address,
        contractCode,
        uploadFee,
        "Upload nft_launchapad contract code"
    );

    console.log("  transactionHash: ", storeCodeResponse.transactionHash);
    console.log("  codeId: ", storeCodeResponse.codeId);
    console.log(
        "  gasWanted / gasUsed: ",
        storeCodeResponse.gasWanted,
        " / ",
        storeCodeResponse.gasUsed
    );

    return storeCodeResponse;
}

/// @dev Instantiate contract base on the code id and instantiate message of contract
/// @param `_codeID` - The code id of the contract
/// @param `instantiateMsg` - The instantiate message of the contract
/// @return `instantiateResponse` - The response of the instantiate transaction
async function instantiate(contract_code_id, instantiateMsg) {
    console.log("Instantiating contract...");

    //Instantiate the contract
    const instantiateResponse = await deployerClient.instantiate(
        deployerAccount.address,
        Number(contract_code_id),
        instantiateMsg,
        "instantiation contract",
        "auto"
    );
    console.log("  transactionHash: ", instantiateResponse.transactionHash);
    console.log("  contractAddress: ", instantiateResponse.contractAddress);
    console.log(
        "  gasWanted / gasUsed: ",
        instantiateResponse.gasWanted,
        " / ",
        instantiateResponse.gasUsed
    );

    return instantiateResponse;
}

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

/// @dev Query information from the contract
/// @param `userClient` - The client of the user who execute the message
/// @param `contract` - The address of the contract
/// @param `queryMsg` - The message that will be executed
/// @return `queryResponse` - The response of the query
async function query(userClient, contract, queryMsg) {
    console.log("Querying contract...");

    const queryResponse = await userClient.queryContractSmart(
        contract,
        queryMsg
    );

    console.log("  Querying successful");

    return queryResponse;
}

async function main(contract_name) {
    // ***************************
    // SETUP INFORMATION FOR USERS
    // ***************************
    let token_code_id = 588;
    let token_name_list = [
        "Binance-Peg BUSD Token",
        "Coin98",
        "MSTR Token",
        "Binance-Peg BSC-USD",
        "Wrapped BNB",
    ];
    let token_name_symbol_list = ["BUSD", "C98", "MSTR", "USDT", "WBNB"];
    let token_decimal_list = [18, 18, 18, 18, 18];
    let minter = "aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n";
    let initial_balances_address =
        "aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n";
    let initial_balances_amount = "1000000000000000000000000000";
    let cap = "20000000000000000000000000000";
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

    // prepare instantiate message
    for (let i = 0; i < token_name_list.length; i++) {
        let token_instantiate_msg = {
            name: token_name_list[i],
            symbol: token_name_symbol_list[i],
            decimals: token_decimal_list[i],
            initial_balances: [
                {
                    address: initial_balances_address,
                    amount: initial_balances_amount,
                },
            ],
            mint: {
                minter: minter,
                cap: cap,
            },
        };
        // instantiate contract
        let token_instantiate_response = await instantiate(
            token_code_id,
            token_instantiate_msg
        );
        // Print out the result
        console.log("Contract deployment information:");
        console.log(
            token_name_list[i] + " contract address: ",
            token_instantiate_response.contractAddress
        );
    }

    console.log("Halo setup completed!");
}

const myArgs = process.argv.slice(2);
// if (myArgs.length != 1) {
//     console.log("Usage: node 0_launchpad_setup.js <wasm_contract_name>");
//     process.exit(1);
// }
main();
