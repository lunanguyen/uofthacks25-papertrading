export function PageHeader() {
    return <div className="flex flex-row m-8 gap-80 justify-between border-blue border-2 rounded-3xl bg:blur-sm sticky top-4 backdrop-blur-sm"> 

            <div className="p-4 ml-4">PerspecTrade</div>

            <div className="flex flex-row gap-8 p-4 mr-4">
                <div>LogoName</div>
                <div>Log In</div>
            </div>
            
        </div>;
}