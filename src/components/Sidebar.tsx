import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PinochleGame } from "@/shared/PinochleGame";
import { Button } from "@/components/ui/button";
import { Trash2, SquarePlus, RadioTower } from "lucide-react";
import { animated, useTransition } from "@react-spring/web";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { fetcher } from "itty-fetcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectToGameProps {
  onSetGameName: (name: string) => void;
  children: React.ReactNode;
}

function ConnectToGame({ onSetGameName, children }: ConnectToGameProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGameNotFound, setIsGameNotFound] = useState(false);
  const [open, setOpen] = useState(false);

  function checkGameName() {
    console.log(`Checking game name: ${name}`);
    setIsLoading(true);
    setIsGameNotFound(false);
    const apiUrl =
      import.meta.env.MODE === "development"
        ? "http://localhost:8787"
        : "https://api.pinochle.spenserbushey.com";
    const api = fetcher({ base: apiUrl });
    api
      .get(`/v1/game/connect/${name}`)
      .then(() => {
        onSetGameName(name);
        setOpen(false);
        setIsGameNotFound(false);
        setIsLoading(false);
      })
      .catch(() => {
        setIsGameNotFound(true);
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Game Connection</DialogTitle>
          <DialogDescription>Connect to a shared game</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          {isGameNotFound && (
            <span className="text-red-500">Invalid Game Name</span>
          )}
          <div className="flex flex-row gap-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button disabled={isLoading} onClick={checkGameName}>
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GameListProps {
  games: Array<PinochleGame>;
  onChange: (games: Array<PinochleGame>) => void;
  openGame: (index: number) => void; // Returns index of user selected game
  onSetGameName: ConnectToGameProps["onSetGameName"];
}

function GameList({ games, onChange, openGame, onSetGameName }: GameListProps) {
  function deleteGame(index: number) {
    let temp = [...games];
    temp.splice(index, 1);
    if (temp.length < 1) {
      temp = [new PinochleGame()];
    }
    onChange(temp);
  }

  function addNewGame() {
    const temp = [...games];
    temp.push(new PinochleGame());
    onChange(temp);
  }

  const gameTransitions = useTransition(games, {
    from: { x: 0, y: 300, opacity: -0.2 },
    enter: { x: 0, y: 0, opacity: 1 },
    leave: { x: -300, y: 0, opacity: -0.2 },
    trail: 100,
    keys: games.map((game) => game.uuid),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-6">
        <h1 className="m-auto text-2xl">My Games</h1>

        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <ConnectToGame onSetGameName={onSetGameName}>
              <TooltipTrigger asChild>
                <Button variant="link" className="hover:text-green-500">
                  <RadioTower />
                </Button>
              </TooltipTrigger>
            </ConnectToGame>
            <TooltipContent asChild>
              <span>Connect to a game</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={addNewGame}
                variant="link"
                className="hover:text-blue-500"
              >
                <SquarePlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent asChild>
              <span>Create a new game</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {gameTransitions((style, game, _, index) => (
        <animated.div
          style={style}
          key={game.uuid}
          className="flex flex-row gap-2"
        >
          <Button onClick={() => openGame(index)} className="w-72">
            {game.gameName}
          </Button>
          <Button
            onClick={() => deleteGame(index)}
            variant="link"
            className="hover:text-red-500"
          >
            <Trash2 />
          </Button>
        </animated.div>
      ))}
    </div>
  );
}

export interface SidebarProps extends GameListProps, ConnectToGameProps {
  children: React.ReactNode;
}

export function Sidebar({
  children,
  onSetGameName,
  games,
  onChange,
  openGame,
}: SidebarProps) {
  const [open, setOpen] = useState(false);

  function setGameNameAndClose(name: string) {
    onSetGameName(name);
    setOpen(false);
  }

  function openGameAndClose(index: number) {
    openGame(index);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left">
        <GameList
          games={games}
          onChange={onChange}
          openGame={openGameAndClose}
          onSetGameName={setGameNameAndClose}
        />
      </SheetContent>
    </Sheet>
  );
}
