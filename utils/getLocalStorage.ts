export const getLocalStorage = () => {
  const localStorageData = localStorage.getItem("wallet-state");

  if (localStorageData !== null) {
    const walletState = JSON.parse(localStorageData);
    return walletState.state.isConnect;
  } else {
    console.log("Данные отсутствуют в локальном хранилище.");
  }
}