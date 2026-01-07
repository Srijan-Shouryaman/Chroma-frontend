package com.prism.security_core.blockchain;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;

@Service
public class Web3Service {

    private final Web3j web3j;
    private final Credentials credentials;
    private final String contractAddress;

    public Web3Service(
            @Value("${blockchain.private-key}") String privateKey,
            @Value("${blockchain.contract-address}") String contractAddress) {

        this.web3j = Web3j.build(
                new HttpService("https://rpc-amoy.polygon.technology"));
        this.credentials = Credentials.create(privateKey);
        this.contractAddress = contractAddress;
    }

    public String verifyHumanOnChain(String userWallet) throws Exception {

        Function function = new Function(
                "verifyHuman",
                Collections.singletonList(new Address(userWallet)),
                Collections.emptyList());

        String encodedFunction = FunctionEncoder.encode(function);

        RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, 80002);

        PolygonGasProvider gasProvider = new PolygonGasProvider();

        EthSendTransaction tx = txManager.sendTransaction(
                gasProvider.getGasPrice(),
                gasProvider.getGasLimit(),
                contractAddress,
                encodedFunction,
                null);

        if (tx.hasError()) {
            throw new RuntimeException(tx.getError().getMessage());
        }

        return tx.getTransactionHash();
    }
}
