const LoadingScreen = () => {
    return (
        <div className="w-full h-full backdrop-blur-xl bg-base-200 opacity-90 z-20 fixed top-0 left-0 flex flex-col items-center justify-center gap-8">
            <span className="loading loading-spinner loading-lg"></span>
            <div className=" text-2xl font-extrabold text ">
                Loading... Please wait
            </div>
        </div>
    );
};

export default LoadingScreen;
