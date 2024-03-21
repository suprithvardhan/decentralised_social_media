const express = require('express');
const Web3 = require('web3');
const contractABI = require('./contracts/SocialNetworkABI.json');

const app = express();
const web3 = new Web3('http://localhost:8545'); // Assuming Ganache is running on port 8545
const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138'; // Replace with your actual contract address
const contract = new web3.eth.Contract(contractABI, contractAddress);

app.use(express.json());

// Route to create a new user account
app.post('/register', async (req, res) => {
    try {
        const account = web3.eth.accounts.create(); // Generate a new account
        res.json({ address: account.address, privateKey: account.privateKey });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to set user profile
app.post('/setProfile', async (req, res) => {
    try {
        const { username, profilePicture, address, privateKey } = req.body;
        const userAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
        const gas = await contract.methods.setProfile(username, profilePicture).estimateGas({ from: userAccount.address });
        const tx = await contract.methods.setProfile(username, profilePicture).send({ from: userAccount.address, gas });
        res.json({ message: 'Profile set successfully', txHash: tx.transactionHash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to fetch posts
app.get('/getPosts', async (req, res) => {
    try {
        const posts = await contract.methods.getPosts().call();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
