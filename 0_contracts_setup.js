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

    //  list of contract names
    let contract_names = [
        "halo_factory",
        "halo_pair",
        "halo_router",
        "cw20_base",
    ];

    let factory_code_id, pair_code_id, router_code_id, token_code_id;

    for (let i = 0; i < contract_names.length; i++) {
        if (contract_names[i] == "halo_factory") {
            console.log("Storing halo_factory contract code...");
            let storeCodeResponse = await store_contract(contract_names[i]);
            factory_code_id = storeCodeResponse.codeId;
        } else if (contract_names[i] == "halo_pair") {
            console.log("Storing halo_pair contract code...");
            let storeCodeResponse = await store_contract(contract_names[i]);
            pair_code_id = storeCodeResponse.codeId;
        } else if (contract_names[i] == "halo_router") {
            console.log("Storing halo_router contract code...");
            let storeCodeResponse = await store_contract(contract_names[i]);
            router_code_id = storeCodeResponse.codeId;
        } else if (contract_names[i] == "cw20_base") {
            console.log("Storing cw20_base contract code...");
            let storeCodeResponse = await store_contract(contract_names[i]);
            token_code_id = storeCodeResponse.codeId;
        }
    }

    // instantiate contract halo_factory
    console.log("Instantiating halo_factory contract...");
    // prepare instantiate message
    const haloFactoryInstantiateMsg = {
        pair_code_id: pair_code_id,
        token_code_id: token_code_id,
    };
    // instantiate contract
    let haloFactoryInstantiateResponse = await instantiate(
        factory_code_id,
        haloFactoryInstantiateMsg
    );

    // instantiate contract halo_router
    console.log("Instantiating halo_router contract...");
    // prepare instantiate message
    const haloRouterInstantiateMsg = {
        halo_factory: haloFactoryInstantiateResponse.contractAddress,
    };
    // instantiate contract
    let haloRouterInstantiateResponse = await instantiate(
        router_code_id,
        haloRouterInstantiateMsg
    );

    // instantiate contract halo_token
    console.log("Instantiating halo_token contract...");
    // prepare instantiate message
    const haloTokenInstantiateMsg = {
        name: "Halo Token",
        symbol: "HALO",
        decimals: 6,
        initial_balances: [
            {
                address: "aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n",
                amount: "1000000000000000",
            },
        ],
        mint: {
            minter: "aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n",
            cap: "20000000000000000",
        },
    };
    // instantiate contract
    let haloTokenInstantiateResponse = await instantiate(
        token_code_id,
        haloTokenInstantiateMsg
    );

    // Print out the result
    console.log("Contract deployment information:");
    console.log("Router contract code id: ", router_code_id);
    console.log(
        "Router contract address: ",
        haloRouterInstantiateResponse.contractAddress
    );
    console.log("Factory contract code id: ", factory_code_id);
    console.log(
        "Factory contract address: ",
        haloFactoryInstantiateResponse.contractAddress
    );
    console.log("Pair contract code id: ", pair_code_id);
    console.log("Token contract code id: ", token_code_id);

    console.log(
        "Token contract address: ",
        haloTokenInstantiateResponse.contractAddress
    );

    console.log("Halo setup completed!");
}

const myArgs = process.argv.slice(2);
// if (myArgs.length != 1) {
//     console.log("Usage: node 0_launchpad_setup.js <wasm_contract_name>");
//     process.exit(1);
// }
main();
