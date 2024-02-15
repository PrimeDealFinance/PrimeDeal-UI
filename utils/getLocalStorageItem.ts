export const getLocalStorageItem = () => {
  if (typeof window !== 'undefined') {
    const localStorageData = localStorage.getItem("wallet-state");

    if (localStorageData !== null) {
      const walletState = JSON.parse(localStorageData);
      return walletState.state.isConnect;
    } else {
      console.log("Data is missing from local storage.");
    }
  }
};
