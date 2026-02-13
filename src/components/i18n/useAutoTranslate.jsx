import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "./LanguageProvider";

const cache = {};

const langNames = {
  en: "English",
  es: "Spanish",
  ht: "Haitian Creole",
  ru: "Russian",
};

export function useAutoTranslate(texts) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState({});
  const pendingRef = useRef(false);

  useEffect(() => {
    if (language === "en" || !texts || texts.length === 0) {
      setTranslated({});
      return;
    }

    const toTranslate = texts.filter((t) => t && !cache[`${language}:${t}`]);

    // Set cached values immediately
    const cached = {};
    texts.forEach((t) => {
      if (t && cache[`${language}:${t}`]) {
        cached[t] = cache[`${language}:${t}`];
      }
    });
    if (Object.keys(cached).length > 0) {
      setTranslated((prev) => ({ ...prev, ...cached }));
    }

    if (toTranslate.length === 0 || pendingRef.current) return;

    pendingRef.current = true;

    // Batch translate in chunks of 10
    const chunks = [];
    for (let i = 0; i < toTranslate.length; i += 10) {
      chunks.push(toTranslate.slice(i, i + 10));
    }

    const translateChunk = async (chunk) => {
      const numbered = chunk.map((t, i) => `${i + 1}. ${t}`).join("\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following texts to ${langNames[language]}. Keep the same numbering. Only output the translations, nothing else. Do not add any explanations.\n\n${numbered}`,
        response_json_schema: {
          type: "object",
          properties: {
            translations: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });

      const results = {};
      if (res.translations && Array.isArray(res.translations)) {
        chunk.forEach((original, i) => {
          const tr = res.translations[i] || original;
          // Remove leading number pattern like "1. " or "1- "
          const cleaned = tr.replace(/^\d+[\.\-\)]\s*/, "");
          cache[`${language}:${original}`] = cleaned;
          results[original] = cleaned;
        });
      }
      return results;
    };

    (async () => {
      const allResults = {};
      for (const chunk of chunks) {
        const res = await translateChunk(chunk);
        Object.assign(allResults, res);
      }
      setTranslated((prev) => ({ ...prev, ...allResults }));
      pendingRef.current = false;
    })();
  }, [language, texts?.join("|")]);

  const tt = (text) => {
    if (!text || language === "en") return text;
    return translated[text] || cache[`${language}:${text}`] || text;
  };

  return { tt, isTranslating: language !== "en" && texts?.some((t) => t && !translated[t] && !cache[`${language}:${t}`]) };
}