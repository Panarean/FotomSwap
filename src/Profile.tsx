import {
    useAccount,
    useConnect,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
  } from 'wagmi'
   
  export function Profile() {
    const { address, connector, isConnected } = useAccount()
    const { data: ensName } = useEnsName({ address })
    const { connect, connectors, error, isLoading, pendingConnector } =
      useConnect()
    const { disconnect } = useDisconnect()
   
    if (isConnected) {
      return (
        <div>
          
          <div>{ensName ? `${ensName} (${address})` : address}</div>
          <div>Connected to {connector?.name}</div>
          <button onClick={()=>disconnect}>Disconnect</button>
        </div>
      )
    }
   
    return (
      <div>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              ' (connecting)'}
          </button>
        ))}
   
        {error && <div>{error.message}</div>}
      </div>
    )
  }