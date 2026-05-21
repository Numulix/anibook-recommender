import OpenAI from "openai";

const MODEL = "text-embedding-3-small";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  return (client ??= new OpenAI());
}

export async function embedBatch(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const res = await getClient().embeddings.create({ model: MODEL, input: inputs });
  return res.data.map((d) => d.embedding);
}

export async function embedInBatches(inputs: string[], batchSize = 100): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < inputs.length; i += batchSize) {
    out.push(...(await embedBatch(inputs.slice(i, i + batchSize))));
  }
  return out;
}
