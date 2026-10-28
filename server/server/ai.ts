import OpenAI from "openai";
import Node from "../types/node";
import { ChatCompletion } from "openai/resources/chat";

class AiSecondPlayer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createGameRules(nodeList: Node[]): Promise<ChatCompletion> {
    const test = [{ x: nodeList[0].x, y: nodeList[0].y }];

    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are in the web game "Dots". 
           Two players take part in the game. 
           You are a second player.
           A goal of each player is to surround as many rival nodes as possible until there're no more empty points on the game field. 
           You will be provided a full array of both user nodes representing a state of field.
           The gaming field has points with coordinates. Each of point is represented by a Node object.
           The top-left point of the field has coordinates: {x: 16, y: 1}.
           The top-right point of the field has coordinates {x: 21, y: 16}.
           The bottom-left point of the field has coordinate {x: 1, y: 1}.
           The bottom-right point of the field has coordinate {x: 21, y: 1}.
           `,
        },
        {
          role: "assistant",
          content: `type Node = {
              x: number;
              y: number;
              player: Player;
              next: Node | null;
              prev: Node | null;
              coordinate: Coordinate | null;
              partOfChain: boolean;
              isTrapped: boolean;
            }`,
        },
        {
          role: "assistant",
          content: `The full array of both user nodes representing the state of the field: ${test}`,
        },
        {
          role: "user",
          content:
            "Generate a Node object for your next turn based on the state of the field",
        },
      ],
      model: "gpt-3.5-turbo",
    });

    return completion;
  }
}

export default AiSecondPlayer;
