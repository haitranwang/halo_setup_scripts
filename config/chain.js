'use strict';

const local = {
    rpcEndpoint: 'http://localhost:26657',
    prefix: 'aura',
    denom: 'uaura',
    chainId: 'local-aura',
    broadcastTimeoutMs: 2000,
    broadcastPollIntervalMs: 500,
    cw20Tokens: {
        'BUSD': 'aura1qwj4gcay2lldg59hy3x0sftenhrmxz5sj3yt62u7ds5erlz055zsvna7q7',
        'C98': 'aura14ezx5er4hd2yr87etadq2zuyqyqqfy82t84wlj8cz2sl4mmnh04sj9rhfk',
        'MSTR': 'aura1vfy9ythluhumtltwra8yu4gwywp75j3mftzxjfh6l2yn3rnew3js6z26jg',
        'USDT': 'aura1gqt0p5vwn2jz99pvfxcp325sepkat85tetajth2xup3je0d90rjsjf33mp',
        'WBNB': 'aura107r0h664jcv76lpjws9uy32vva0mncl6t5ss058zqlay384vrays3r9fk7'
    },
};

const localDocker = {
    rpcEndpoint: 'http://dev-aurad:26657',
    prefix: 'aura',
    denom: 'uaura',
    chainId: 'local-aura',
    broadcastTimeoutMs: 2000,
    broadcastPollIntervalMs: 500,
    cw20Tokens: {
        'BUSD': 'aura1qwj4gcay2lldg59hy3x0sftenhrmxz5sj3yt62u7ds5erlz055zsvna7q7',
        'C98': 'aura14ezx5er4hd2yr87etadq2zuyqyqqfy82t84wlj8cz2sl4mmnh04sj9rhfk',
        'MSTR': 'aura1vfy9ythluhumtltwra8yu4gwywp75j3mftzxjfh6l2yn3rnew3js6z26jg',
        'USDT': 'aura1gqt0p5vwn2jz99pvfxcp325sepkat85tetajth2xup3je0d90rjsjf33mp',
        'WBNB': 'aura107r0h664jcv76lpjws9uy32vva0mncl6t5ss058zqlay384vrays3r9fk7'
    },
};

const serenity = {
    rpcEndpoint: 'https://rpc.serenity.aura.network',
    prefix: 'aura',
    denom: 'uaura',
    chainId: 'serenity-testnet-001',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000,
    cw20Tokens: {
        'BUSD': 'aura1qwj4gcay2lldg59hy3x0sftenhrmxz5sj3yt62u7ds5erlz055zsvna7q7',
        'C98': 'aura14ezx5er4hd2yr87etadq2zuyqyqqfy82t84wlj8cz2sl4mmnh04sj9rhfk',
        'MSTR': 'aura1vfy9ythluhumtltwra8yu4gwywp75j3mftzxjfh6l2yn3rnew3js6z26jg',
        'USDT': 'aura1gqt0p5vwn2jz99pvfxcp325sepkat85tetajth2xup3je0d90rjsjf33mp',
        'WBNB': 'aura107r0h664jcv76lpjws9uy32vva0mncl6t5ss058zqlay384vrays3r9fk7'
    },
};

const auraTestnet = {
    rpcEndpoint: 'https://rpc.dev.aura.network',
    prefix: 'aura',
    denom: 'utaura',
    chainId: 'aura-testnet',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000,
    cw20Tokens: {
        'BUSD': 'aura1qsu5nr08nf23jaj0lsjztzxztvysukx46ncqkjnt89de9tn52puslxcz9m',
        'C98': 'aura1u4edngajd5arhvek7wx689jghrj3yedgldxz48agldlxtspqvqssyddars',
        'MSTR': 'aura1er7f3u3l82sj05xq8pghj33evykvdlar085650mdd4ddxrgps5xq2k6c23',
        'USDT': 'aura1l692ynn938ymqsem04r8zk0274llk7r2wmlxdrud034rstjzyeaqada3wc',
        'WBNB': 'aura1jhc3hg4m76nwzwj0n2g6trqdh4yq0v8e82vmt49wl6qg3nye08rswtwrla'
    },
};

const euphoria = {
    rpcEndpoint: 'https://rpc.euphoria.aura.network',
    prefix: 'aura',
    denom: 'ueaura',
    chainId: 'euphoria-1',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000,
    cw20Tokens: {
        'BUSD': 'aura1qwj4gcay2lldg59hy3x0sftenhrmxz5sj3yt62u7ds5erlz055zsvna7q7',
        'C98': 'aura14ezx5er4hd2yr87etadq2zuyqyqqfy82t84wlj8cz2sl4mmnh04sj9rhfk',
        'MSTR': 'aura1vfy9ythluhumtltwra8yu4gwywp75j3mftzxjfh6l2yn3rnew3js6z26jg',
        'USDT': 'aura1gqt0p5vwn2jz99pvfxcp325sepkat85tetajth2xup3je0d90rjsjf33mp',
        'WBNB': 'aura107r0h664jcv76lpjws9uy32vva0mncl6t5ss058zqlay384vrays3r9fk7'
    },
};

const mainnet = {
    rpcEndpoint: 'https://rpc.aura.network',
    prefix: 'aura',
    denom: 'uaura',
    chainId: 'xstaxy-1',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000,
    cw20Tokens: {
        'BUSD': 'aura1qwj4gcay2lldg59hy3x0sftenhrmxz5sj3yt62u7ds5erlz055zsvna7q7',
        'C98': 'aura14ezx5er4hd2yr87etadq2zuyqyqqfy82t84wlj8cz2sl4mmnh04sj9rhfk',
        'MSTR': 'aura1vfy9ythluhumtltwra8yu4gwywp75j3mftzxjfh6l2yn3rnew3js6z26jg',
        'USDT': 'aura1gqt0p5vwn2jz99pvfxcp325sepkat85tetajth2xup3je0d90rjsjf33mp',
        'WBNB': 'aura107r0h664jcv76lpjws9uy32vva0mncl6t5ss058zqlay384vrays3r9fk7'
    },
};

let defaultChain = auraTestnet;


defaultChain.deployer_mnemonic = process.env.MNEMONIC
    || 'grief assault labor select faint leader impulse broken help garlic carry practice cricket cannon draw resist clump jar debris sentence notice poem drip benefit';

defaultChain.tester_mnemonic = 'forward picnic antenna marble various tilt problem foil arrow animal oil salon catch artist tube dry noise door cliff grain fox left loan reopen';


module.exports = {
    local,
    serenity,
    euphoria,
    auraTestnet,
    defaultChain
};