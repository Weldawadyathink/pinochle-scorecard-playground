import { useState } from "react";
import { PinochleGame } from "@/shared/PinochleGame";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { fetcher } from "itty-fetcher";
import { Button } from "@/components/ui/button";
import {
  CircleChevronLeft,
  CirclePlus,
  Share2,
  Swords,
  Trash2,
} from "lucide-react";
import { PinochleRound } from "@/shared/PinochleRound";
import { set, cloneDeep } from "lodash-es";
import { animated, useTransition } from "@react-spring/web";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionHeader,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  IconSquareRoundedNumber1,
  IconSquareRoundedNumber2,
  IconSquareRoundedNumber3,
  IconSquareRoundedNumber4,
  IconSquareRoundedNumber5,
  IconSquareRoundedNumber6,
  IconSquareRoundedNumber7,
  IconSquareRoundedNumber8,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface RoundIconProps {
  number: number;
  stroke: number;
  width: number;
  height: number;
  className: string;
}

function RoundIcon({ number, ...props }: RoundIconProps) {
  return (
    <>
      {number === 1 && <IconSquareRoundedNumber1 {...(props as any)} />}
      {number === 2 && <IconSquareRoundedNumber2 {...(props as any)} />}
      {number === 3 && <IconSquareRoundedNumber3 {...(props as any)} />}
      {number === 4 && <IconSquareRoundedNumber4 {...(props as any)} />}
      {number === 5 && <IconSquareRoundedNumber5 {...(props as any)} />}
      {number === 6 && <IconSquareRoundedNumber6 {...(props as any)} />}
      {number === 7 && <IconSquareRoundedNumber7 {...(props as any)} />}
      {number === 8 && <IconSquareRoundedNumber8 {...(props as any)} />}
    </>
  );
}

interface PinochleRoundEditorProps {
  data: PinochleRound;
  onChange: (data: PinochleRound) => void;
  onDeleteRound: () => void;
}

function PinochleRoundEditor({
  data,
  onChange,
  onDeleteRound,
  ...props
}: PinochleRoundEditorProps) {
  function setData(path: string, value: any) {
    const temp = cloneDeep(data);
    set(temp, path, value);
    onChange(temp);
  }

  function setInt(path: string, value: string) {
    const temp = cloneDeep(data);
    set(temp, path, parseInt(value, 10));
    onChange(temp);
  }

  function toggleBid() {
    setData("teamWithBid", data.teamWithBid === "a" ? "b" : "a");
  }

  return (
    <>
      <div className="grid grid-cols-5 gap-2 my-4" {...props}>
        {data.teamWithBid === "a" ? (
          <div className="flex flex-col col-span-2 justify-self-end">
            <span className="text-right">Bid</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={data.bid}
              onChange={(e) => setInt("bid", e.target.value)}
              className="text-right"
            />
          </div>
        ) : (
          <div className="col-span-2"></div>
        )}
        <CircleChevronLeft
          width={32}
          height={32}
          className={cn(
            "justify-self-center my-auto ease-in-out duration-500",
            data.teamWithBid === "b" ? "rotate-[-180deg]" : "",
          )}
          onClick={toggleBid}
        />
        {data.teamWithBid === "b" ? (
          <div className="flex flex-col col-span-2 justify-self-start">
            <span className="text-left">Bid</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={data.bid}
              onChange={(e) => setInt("bid", e.target.value)}
              className="text-left"
            />
          </div>
        ) : (
          <div className="col-span-2"></div>
        )}

        <div className="flex flex-col col-span-2 justify-self-end text-right">
          <span>Meld</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.teamAMeldScore}
            onChange={(e) => setInt("teamAMeldScore", e.target.value)}
            className="text-right"
          />
        </div>
        <div></div>
        <div className="flex flex-col col-span-2 justify-self-start text-left">
          <span>Meld</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.teamBMeldScore}
            onChange={(e) => setInt("teamBMeldScore", e.target.value)}
            className="text-left"
          />
        </div>

        <div className="flex flex-col col-span-2 justify-self-end text-right">
          <span>Tricks</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.teamATrickScore}
            onChange={(e) => setInt("teamATrickScore", e.target.value)}
            className="text-right"
          />
        </div>
        <Button
          variant="link"
          className="hover:text-red-500 justify-self-center mt-auto duration-300 ease-in-out"
          onClick={onDeleteRound}
        >
          <Trash2 />
        </Button>
        <div className="flex flex-col col-span-2 justify-self-start text-left">
          <span>Tricks</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.teamBTrickScore}
            onChange={(e) => setInt("teamBTrickScore", e.target.value)}
            className="text-left"
          />
        </div>
      </div>
      <Separator />
    </>
  );
}

interface PinochleGameEditorProps {
  game: PinochleGame;
  onChange: (game: PinochleGame) => void;
}

function PinochleGameEditor({ game, onChange }: PinochleGameEditorProps) {
  const [shouldOpenNewestRound, setShouldOpenNewestRound] = useState(false);
  const [openRound, setOpenRoundDirectly] = useState("");

  function setOpenRound(round: string) {
    if (openRound === round) {
      setOpenRoundDirectly("");
    } else {
      setOpenRoundDirectly(round);
    }
  }

  function setRound(index: number, roundData: PinochleRound) {
    const temp = cloneDeep(game);
    temp.rounds[index] = roundData;
    onChange(temp);
  }

  function newRound() {
    if (game.rounds.length >= 8) {
      console.log("Tried to add new round, but there are already 8 rounds");
    } else {
      const temp = cloneDeep(game);
      temp.newRound();
      setShouldOpenNewestRound(true);
      onChange(temp);
    }
  }

  if (shouldOpenNewestRound) {
    setOpenRoundDirectly(game.rounds[game.rounds.length - 1].uuid);
    setShouldOpenNewestRound(false);
  }

  const roundTransitions = useTransition(
    ["TeamNameEditor" as const, ...game.rounds, "NewRoundButton" as const],
    {
      from: { x: 0, y: -50, opacity: -0.2, scale: 0 },
      enter: { x: 0, y: 0, opacity: 1, scale: 1 },
      leave: { x: 0, y: 50, opacity: -0.2, scale: 0 },
      trail: 100,
      keys: [
        "TeamNameEditor",
        ...game.rounds.map((r) => r.uuid),
        "NewRoundButton",
      ],
    },
  );

  function setTeamAName(name: string) {
    const temp = cloneDeep(game);
    temp.teamAName = name;
    onChange(temp);
  }

  function setTeamBName(name: string) {
    const temp = cloneDeep(game);
    temp.teamBName = name;
    onChange(temp);
  }

  function deleteRound(index: number) {
    const temp = cloneDeep(game);
    temp.rounds.splice(index, 1);
    if (temp.rounds.length < 1) {
      temp.newRound();
    }
    onChange(temp);
  }

  return (
    <Accordion
      type="single"
      value={openRound}
      onValueChange={setOpenRound}
      className="flex flex-col gap-6"
    >
      {roundTransitions((style, round, _, index) => {
        if (typeof round === "string") {
          if (round === "NewRoundButton") {
            return (
              <>
                {game.rounds.length < 8 && (
                  <animated.div className="grid grid-cols-5" style={style}>
                    <Button
                      onClick={newRound}
                      className="col-start-3 justify-self-center"
                      variant="link"
                    >
                      <CirclePlus
                        width={42}
                        height={42}
                        className="hover:text-violet-500 ease-in-out duration-300"
                      />
                    </Button>
                  </animated.div>
                )}
              </>
            );
          }
          if (round === "TeamNameEditor") {
            return (
              <animated.div className="grid grid-cols-5 gap-2" style={style}>
                <Input
                  value={game.teamAName}
                  className="text-right text-2xl col-span-2 justify-self-end my-auto !border-none"
                  onChange={(e) => setTeamAName(e.target.value)}
                />
                <Swords
                  className="justify-self-center"
                  width={60}
                  height={60}
                />
                <Input
                  value={game.teamBName}
                  className="text-left text-2xl col-span-2 justify-self-start my-auto !border-none"
                  onChange={(e) => setTeamBName(e.target.value)}
                />
              </animated.div>
            );
          }
        }
        return (
          <animated.div key={round.uuid} style={style}>
            <AccordionItem value={round.uuid}>
              <AccordionHeader
                className="grid grid-cols-5 gap-2"
                onClick={() => setOpenRound(round.uuid)}
              >
                <span className="col-span-2 my-auto justify-self-end text-xl">
                  {game.getTeamAScore(index - 1)}
                </span>
                <RoundIcon
                  number={index}
                  width={42}
                  height={42}
                  stroke={2}
                  className="justify-self-center hover:text-violet-500 ease-in-out duration-300"
                />
                <span className="col-span-2 my-auto justify-self-start text-xl">
                  {game.getTeamBScore(index - 1)}
                </span>
              </AccordionHeader>

              <AccordionContent asChild>
                <PinochleRoundEditor
                  data={round}
                  onChange={(d) => setRound(index - 1, d)}
                  onDeleteRound={() => deleteRound(index - 1)}
                />
              </AccordionContent>
            </AccordionItem>
          </animated.div>
        );
      })}
    </Accordion>
  );
}

export interface MainGameEditorProps {
  gameData: PinochleGame;
  onGameDataChange: (data: PinochleGame) => void;
  sharedGameName?: string;
}

export function GameEditor({
  gameData,
  onGameDataChange,
  sharedGameName,
}: MainGameEditorProps) {
  // TODO: Fetch game state from server when given a sharedGameName
  const [connectToSocket, setConnectToSocket] = useState(!!sharedGameName);
  const [appId] = useState(crypto.randomUUID());
  const [socketUrl, setSocketUrl] = useState(
    import.meta.env.MODE === "development"
      ? `ws://localhost:8787/v1/game/connect/${sharedGameName}`
      : `wss://api.pinochle.spenserbushey.com/v1/game/connect/${sharedGameName}`,
  );
  const { sendJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      onMessage: (msg) => {
        console.log(["Received websocket message", msg]);
        const data = JSON.parse(msg.data);
        const senderId = data.senderId;
        if (senderId !== appId) {
          const game = PinochleGame.fromJSON(data.payload);
          onGameDataChange(game);
        }
      },
      onOpen: () => {
        console.log("Requesting update", sharedGameName);
        if (sharedGameName) {
          sendJsonMessage({
            messageType: "requestGameUpdate",
          });
        }
      },
    },
    connectToSocket,
  );

  const gameShareCode: string | null = socketUrl.split("/").pop() || null;

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  let gameSharedStatus: "Private" | "Shared" | "Connecting";
  if (!connectToSocket) {
    gameSharedStatus = "Private";
  } else {
    if (connectionStatus === "Open") {
      gameSharedStatus = "Shared";
    } else {
      gameSharedStatus = "Connecting";
    }
  }

  function setNewGameState(state: PinochleGame) {
    const serialized = JSON.stringify(state);
    sendJsonMessage({
      messageType: "gameUpdate",
      payload: serialized,
      senderId: appId,
    });
    onGameDataChange(state);
  }

  const apiUrl =
    import.meta.env.MODE === "development"
      ? "http://localhost:8787"
      : "https://api.pinochle.spenserbushey.com";
  const websocketUrl =
    import.meta.env.MODE === "development"
      ? "ws://localhost:8787"
      : "wss://api.pinochle.spenserbushey.com";

  function shareGame() {
    if (gameSharedStatus === "Private") {
      console.log("Sharing game");
      const api = fetcher({ base: apiUrl });
      api.get("/v1/game/new").then((response) => {
        setSocketUrl(
          `${websocketUrl}/v1/game/connect/${(response as any).name}`,
        );
        setConnectToSocket(true);
        sendJsonMessage({
          messageType: "gameUpdate",
          payload: JSON.stringify(gameData),
          senderId: appId,
        });
      });
    } else {
      console.log("Game is already shared");
    }
  }

  function setGameName(name: string) {
    const temp = cloneDeep(gameData);
    temp.gameName = name;
    onGameDataChange(temp);
  }

  return (
    <div className="flex flex-col gap-6 relative text-lg text-center">
      <Input
        value={gameData.gameName}
        className="!border-none text-3xl text-center"
        onChange={(e) => setGameName(e.target.value)}
      />
      {gameSharedStatus === "Connecting" && (<span>Connecting to game sharing server...</span>)}
      {gameSharedStatus === "Shared" && (
        <span>{`Sharing Code: ${gameShareCode}`}</span>
      )}
      <Button onClick={shareGame} variant="link" className="absolute right-0">
        <Share2
          className={cn(
            "hover:text-blue-500 ease-in-out duration-300",
            gameSharedStatus === "Connecting"
              ? "text-yellow-500 hover:text-yellow-500"
              : "",
            gameSharedStatus === "Shared"
              ? "text-green-500 hover:text-green-500"
              : "",
          )}
        />
      </Button>
      <PinochleGameEditor
        game={gameData}
        onChange={(d) => setNewGameState(d)}
      />
    </div>
  );
}
