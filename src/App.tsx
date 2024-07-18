import { useEffect, useState } from "react";
import { GameEditor } from "@/components/GameEditor";
import { PinochleGame } from "@/shared/PinochleGame";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function App() {
  const [gameEditorKey, setGameEditorKey] = useState(crypto.randomUUID());
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [connectToGameName, setConnectToGameName] = useState<
    string | undefined
  >(undefined);
  const [allGames, setAllGames] = useState<Array<PinochleGame>>(() => {
    const savedGames = localStorage.getItem("PinochleGames");
    let parsedGames = null;
    if (savedGames) {
      const parsed = JSON.parse(savedGames);
      parsedGames = parsed.map((item: any) => PinochleGame.fromJSON(item));
    }
    return parsedGames || [new PinochleGame()];
  });

  function setGameData(data: PinochleGame) {
    const temp = [...allGames];
    temp[currentGameIndex] = data;
    setAllGames(temp);
  }

  function openGame(index: number) {
    setCurrentGameIndex(index);
    setGameEditorKey(crypto.randomUUID());
    setConnectToGameName(undefined);
  }

  function connectToGame(name: string) {
    setConnectToGameName(name);
    setCurrentGameIndex(allGames.length);
    setAllGames([...allGames, new PinochleGame()]);
    setGameEditorKey(crypto.randomUUID());
  }

  useEffect(() => {
    localStorage.setItem("PinochleGames", JSON.stringify(allGames));
  }, [allGames]);

  return (
    <div className="container max-w-xl mx-auto p-6">
      <div className="relative">
        <Sidebar
          games={allGames}
          onChange={setAllGames}
          openGame={openGame}
          onSetGameName={connectToGame}
        >
          <Button
            variant="link"
            className="hover:text-violet-500 fade-in-out duration-300 absolute right-0"
          >
            <Menu />
          </Button>
        </Sidebar>
        <h1 className="text-3xl text-center mb-4">Pinochle Scorecard</h1>
      </div>
      <GameEditor
        key={gameEditorKey}
        gameData={allGames[currentGameIndex]}
        onGameDataChange={setGameData}
        sharedGameName={connectToGameName}
      />
    </div>
  );
}
