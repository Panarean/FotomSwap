
import './App.css'

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { goerli } from 'viem/chains'
import { publicProvider } from 'wagmi/providers/public'
 
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
//import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
 
import {Provider} from 'react-redux';
import store from './store'
import { Center, Container, useColorModeValue } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { Menu } from './components/Menu'

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()],
)
 
// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: '3fbb6bba6f1de962d911bb5b5c9dba88',
      },
    }), 
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

function App() {
  const bgColor = useColorModeValue('light.bg.primary', 'dark.bg.primary');
  return (
      <WagmiConfig config={config}>
        <Provider store={store}>
                <Center width="100%"  bg={bgColor} flexDirection="column">
                    <BrowserRouter>

                        <Menu />
                        <Container centerContent width="100%" flex={1} maxWidth="container" paddingX="space20">
                            <Container>
                              Home
                            </Container>
                        </Container>
                    </BrowserRouter>
                </Center>
            </Provider>
      </WagmiConfig>
  )
}

export default App
