"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useDrag } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";

type Vocab = { vocab: string; meaning: string };

export default function FlashcardGame() {
  const params = useParams();
  const router = useRouter();
  const category = params.category;

  const [vocabList, setVocabList] = useState<Vocab[]>([]);
  const [originalList, setOriginalList] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState({ remember: 0, learning: 0 });
  const [showMeaning, setShowMeaning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [incorrectVocab, setIncorrectVocab] = useState<Vocab[]>([]);
  const [reviewing, setReviewing] = useState(false);

  const [spring, api] = useSpring(() => ({ x: 0, y: 0, scale: 1 }));

  const shuffleArray = (array: Vocab[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (!category) return;
    const cat = Array.isArray(category) ? category[0] : category; // <-- fix here
  
    const fetchVocab = async () => {
      const snap = await getDocs(collection(db, "vocab", cat, "vocab"));
      const list = snap.docs.map((doc) => doc.data() as Vocab);
      setOriginalList(list);
      setVocabList(shuffleArray(list));
      setLoading(false);
    };
    fetchVocab();
  }, [category]);  

  const startGame = (list: Vocab[]) => {
    setVocabList(shuffleArray(list));
    setIndex(0);
    setStats({ remember: 0, learning: 0 });
    setIncorrectVocab([]);
    setReviewing(false);
    setShowMeaning(false);
    api.start({ x: 0, y: 0, scale: 1 });
  };

  const nextCard = (wasIncorrect = false) => {
    if (wasIncorrect) setIncorrectVocab((prev) => [...prev, vocabList[index]]);
    setIndex((i) => i + 1);
    setShowMeaning(false);
    setSwipeDirection(null);
    api.start({ x: 0, y: 0, scale: 1 });
  };

  const handleSwipeEnd = (mx: number) => {
    if (mx > 100) {
      setStats((s) => ({ ...s, remember: s.remember + 1 }));
      nextCard();
    } else if (mx < -100) {
      setStats((s) => ({ ...s, learning: s.learning + 1 }));
      nextCard(true);
    } else {
      api.start({ x: 0, y: 0, scale: 1 });
      setSwipeDirection(null);
    }
  };

  const bind = useDrag(
    ({ down, movement: [mx, my], last }) => {
      if (!vocabList[index]) return;

      if (last) {
        handleSwipeEnd(mx);
      } else {
        const newY = my < 0 ? my : 0;
        api.start({ x: mx, y: newY, scale: down ? 1.05 : 1, immediate: down });
        setShowMeaning(newY < -120);

        if (mx > 30) setSwipeDirection("right");
        else if (mx < -30) setSwipeDirection("left");
        else setSwipeDirection(null);
      }
    },
    { filterTaps: true }
  );

  if (loading)
    return (
      <div className="text-center mt-20 text-lg relative">
        <p>Loading vocab...</p>
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Back
        </button>
      </div>
    );

  if (index >= vocabList.length) {
    const total = stats.remember + stats.learning;
    const accuracy = total ? Math.round((stats.remember / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-8 space-y-6 relative">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Back
        </button>

        <h2 className="text-3xl font-bold text-purple-700">Study Summary 🎉</h2>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
          <p>Total Cards: {total}</p>
          <p className="text-green-600">Remembered: {stats.remember}</p>
          <p className="text-red-600">Still Learning: {stats.learning}</p>
          <p>Accuracy: {accuracy}%</p>
          <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-4 bg-green-400" style={{ width: `${accuracy}%` }}></div>
          </div>

          {incorrectVocab.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Review Incorrect Vocab:</h3>
              <ul className="space-y-1 max-h-40 overflow-auto">
                {incorrectVocab.map((v, i) => (
                  <li key={i} className="flex justify-between bg-pink-100 rounded px-2 py-1">
                    <span>{v.vocab}</span>
                    <span className="text-gray-700">{v.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-4">
          <button
            className="px-6 py-2 bg-purple-500 text-white rounded-xl shadow hover:bg-purple-600"
            onClick={() => startGame(originalList)}
          >
            Play Again
          </button>
          {incorrectVocab.length > 0 && (
            <button
              className="px-6 py-2 bg-red-400 text-white rounded-xl shadow hover:bg-red-500"
              onClick={() => {
                setReviewing(true);
                startGame(incorrectVocab);
              }}
            >
              Replay Incorrect
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentVocab = vocabList[index]; 

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-8 relative">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 z-10"
      >
        Back
      </button>

      {/* Swipe feedback overlay */}
      {swipeDirection && (
        <div
          className={`absolute w-80 h-60 rounded-xl flex items-center justify-center text-2xl font-bold text-white select-none pointer-events-none
          ${swipeDirection === "left" ? "bg-red-400" : "bg-green-400"}`}
        >
          {swipeDirection === "left" ? "Still Learning ❌" : "Remembered ✅"}
        </div>
      )}

      {/* Card */}
      <animated.div
        {...bind()}
        style={{ x: spring.x, y: spring.y, scale: spring.scale }}
        className={`w-80 h-60 cursor-grab rounded-xl shadow-2xl flex items-center justify-center ${
          showMeaning ? "bg-purple-300" : "bg-white"
        } duration-100 text-3xl font-bold text-gray-800 select-none relative`}
      >
        {showMeaning ? currentVocab.meaning : currentVocab.vocab}
      </animated.div>

      {/* Progress */}
      <div className="absolute top-4 right-4 text-gray-700 font-semibold">
        {index + 1}/{vocabList.length}
      </div>
    </div>
  );
}
