type HeaderProps = {
    adminImg: string;
    adminName: string;
    onMenuClick: () => void;
    onNavigate: (route: string) => void;
};

export default function Header({ adminImg, adminName, onMenuClick, onNavigate }: HeaderProps) {
    return (
        <header className="rounded-b-md bg-primary-800 w-full h-20 py-4 px-4 text-white shadow-lg shadow-black/25">
            <div className=" items-start justify-between">
                <div className="flex items-center gap-4">
                    <img src={adminImg} alt={adminName} className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col">
                        <h1 className="text-md font-semibold">
                            Olá, {adminName}
                        </h1>
                        <p className="mt-1 text-md text-white/80">
                            Bem-vindo ao dashboard
                        </p>
                    </div>
                </div>

            <button
                type="button"
                // onClick={onMenuClick}
                aria-label="Abrir menu"
                className="rounded-lg p-2 text-white transition hover:bg-white/10"
            >
            </button>
            </div>
        </header>
    )
}