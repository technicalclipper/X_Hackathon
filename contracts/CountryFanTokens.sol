// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArgentinaFanToken is ERC20 {
    constructor() ERC20("Argentina Fan Token", "ARG") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}

contract BrazilFanToken is ERC20 {
    constructor() ERC20("Brazil Fan Token", "BRA") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}

contract FranceFanToken is ERC20 {
    constructor() ERC20("France Fan Token", "FRA") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}
