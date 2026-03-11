let socketIoInstance = null;

export const setIo = (instance) => {
    socketIoInstance = instance;
};

export const getIo = () => {
    return socketIoInstance;
};
