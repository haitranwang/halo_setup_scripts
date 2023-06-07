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
        "halo_pool_factory",
        "halo_pool",
    ];

    let pool_factory_code_id, pool_code_id;

    for (let i = 0; i < contract_names.length; i++) {
        if (contract_names[i] == "halo_pool_factory") {
            console.log("Storing halo_pool_factory contract code...");
            let storeCodeResponse = await store_contract(contract_names[i]);
            pool_factory_code_id = storeCodeResponse.codeId;
        } else if (contract_names[i] == "halo_pool") {
            console.log("Storing halo_pool contract code...");
            let storeCodeResponse = await store_contract(contract_names[i]);
            pool_code_id = storeCodeResponse.codeId;
        }
    }

    // instantiate contract halo_pool_factory
    console.log("Instantiating halo_pool_factory contract...");
    // prepare instantiate message
    const haloPoolFactoryInstantiateMsg = {
        pool_code_id: pool_code_id,
    };
    // instantiate contract
    let haloPoolFactoryInstantiateResponse = await instantiate(
        pool_factory_code_id,
        haloPoolFactoryInstantiateMsg
    );

    // Print out the result
    console.log("Factory contract code id: ", pool_factory_code_id);
    console.log(
        "Pool factory contract address: ",
        haloPoolFactoryInstantiateResponse.contractAddress
    );
    console.log("Pool contract code id: ", pool_code_id);

    console.log("Halo farm setup completed!");
}

const myArgs = process.argv.slice(2);
// if (myArgs.length != 1) {
//     console.log("Usage: node 0_launchpad_setup.js <wasm_contract_name>");
//     process.exit(1);
// }
main();
