import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import AutoForm from "./components/ui/auto-form";
import { Button } from "./components/ui/button";

type Recipe = {
  title: string;
  description: string;
  preparation_time: {
    total: number;
    preparation?: number;
    cooking?: number;
  };
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories?: number;
    carbs?: number;
    protein?: number;
    fat?: number;
  };
};

const PROMPTS = {
  _type: `{
  title: string;
  description: string;
  preparation_time: { // em minutos
      total: number;
      preparation?: number; // tempo antes de assar
      cooking?: number; // tempo de forno
  };
  ingredients: string[]; // os itens podem ser em markdown
  instructions: string[]; // os itens podem ser em markdown
  nutrition: {
      calories?: number; // numero em 'kcal'
      carbs?: number; // numero em 'gramas'
      protein?: number; // numero em 'gramas'
      fat?: number; // numero em 'gramas'
  }
}`,
  default:
    'Busque uma receita de "{{name}}" e me devolva em um código JSON, sem quebra de linha, sem formatação, nesse formato (em português)',
  with_details:
    'Busque uma receita de "{{name}}", considerando "{{details}}" e me devolva em um código JSON, sem quebra de linha, sem formatação, nesse formato (em português)',
};

const formSchema = z.object({
  name: z
    .string({
      required_error: "O nome da receita é obrigatório.",
    })
    .max(50, {
      message: "O nome da receita é muito longo (máximo 50 caracteres).",
    })
    .describe("Nome da receita"),

  details: z
    .string()
    .max(200, {
      message:
        "Os detalhes da receita são muito longos (máximo 200 caracteres).",
    })
    .optional()
    .describe("Detalhes da receita"),
});

const titleVariants = cva("scroll-m-20 font-black tracking-tight", {
  variants: {
    recipe_loaded: {
      true: "text-xl mb-4 text-muted-foreground",
      false: "text-4xl lg:text-5xl mb-8",
    },
  },
});

function App() {
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function generateRecipe(data: { name: string; details?: string }) {
    setLoading(true);

    let prompt = "";

    if (typeof data.details === "undefined") {
      prompt = PROMPTS.default
        .replace("{{name}}", data.name)
        .concat("\n\n")
        .concat(PROMPTS._type);
    } else {
      prompt = PROMPTS.with_details
        .replace("{{name}}", data.name)
        .replace("{{details}}", data.details)
        .concat("\n\n")
        .concat(PROMPTS._type);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
      import.meta.env.VITE_GEMINI_API_KEY
    }`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    };

    try {
      const response = await fetch(url, options);
      const json = await response.json();
      setRecipe(JSON.parse(json.candidates[0].content.parts[0].text));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background min-h-dvh w-full flex flex-col items-center justify-center py-12">
      <h1 className={titleVariants({ recipe_loaded: !!recipe })}>
        Chef Gemini
      </h1>
      {!recipe && (
        <AutoForm
          formSchema={formSchema}
          fieldConfig={{
            name: {
              description:
                "Ex.: Brownie; Pizza; Bolo de cenoura com brigadeiro;",
            },
            details: {
              description:
                "Ex.: Receita sem gluten; Em menos de 30 minutos; Para 10 pessoas;",
              fieldType: "textarea",
            },
          }}
          className="px-12 max-w-lg mx-auto"
          onSubmit={(values) => generateRecipe(values)}
        >
          <Button type="submit" className="w-full" disabled={loading}>
            {!loading && "Gerar receita"}
            {loading && <Loader2 size="1rem" className="animate-spin" />}
          </Button>
          <p className="text-gray-500 text-xs text-balance text-center">
            Todas as receitas e os dados delas são gerada por Inteligencia
            Artificial, ou seja, podem haver erros.
          </p>
        </AutoForm>
      )}
      {recipe && (
        <div className="w-full px-8 flex flex-col gap-5 max-w-3xl">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight text-center">
            {recipe.title}
          </h2>
          <p className="text-muted-foreground font-semibold">
            {recipe.description}
          </p>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Ingredientes
          </h3>
          <ul className="ml-6 list-disc [&>li]:mt-2 font-semibold">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={`ingredient_${i + 1}`}>
                {ingredient.replace("* ", "")}
              </li>
            ))}
          </ul>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Modo de preparo
          </h3>
          <ol className="ml-6 list-decimal [&>li]:mt-2 font-semibold">
            {recipe.instructions.map((instruction, i) => (
              <li key={`instruction_${i + 1}`}>
                {instruction.replace(/^\d\.\s/, "")}
              </li>
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}

export default App;
