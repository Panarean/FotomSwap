
import './App.css'

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { goerli } from 'viem/chains'
import { publicProvider } from 'wagmi/providers/public'
import { infuraProvider } from 'wagmi/providers/infura'
 
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
//import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
 
import {Provider} from 'react-redux';
import store from './store'
import { Center, ChakraProvider, Container } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { Menu } from './components/Menu'
import { theme } from './theme'
import { Home } from './pages/Home'

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [infuraProvider({ apiKey: 'aa69bfabb0ff4ec0b80b0577fda29865' }),publicProvider()],
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
  const bgColor = 'dark.bg.primary';
  return (
      <WagmiConfig config={config}>
        <Provider store={store}>
          <ChakraProvider theme={theme}>
              <Center  width="100%"  bg={bgColor} flexDirection="column">
                  <BrowserRouter>
                      <Menu />
                      <Container centerContent width="100%" flex={1} maxWidth="container" paddingX="space20" paddingBottom={'20px'}>
                          <Home />
                      </Container>
                  </BrowserRouter>
              </Center>
            </ChakraProvider>
        </Provider>
      </WagmiConfig>
  )
}

export default App
