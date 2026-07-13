import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowRight, HelpCircle, RefreshCw } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: Array<{ label: string; score: string }>;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    text: 'What is your primary wildlife goal?',
    options: [
      { label: 'See the Big Five (Lions, Elephants, Leopards, Rhinos, Buffalos)', score: 'kenya' },
      { label: 'Track Mountain Gorillas and Chimpanzees up close', score: 'uganda' },
      { label: 'Witness the dramatic Great Wildebeest Migration', score: 'kenya' },
      { label: 'Spot marine life (Whales, Penguins) alongside land animals', score: 'south-africa' },
    ],
  },
  {
    id: 2,
    text: 'What scenery/atmosphere do you prefer?',
    options: [
      { label: 'Classic endless golden savannahs with acacia trees', score: 'kenya' },
      { label: 'Dense, misty mountainous rainforests', score: 'uganda' },
      { label: 'Beautiful coastlines, lush vineyards, and modern cities', score: 'south-africa' },
    ],
  },
  {
    id: 3,
    text: 'How active do you want your holiday to be?',
    options: [
      { label: 'Relaxed game drives in open-top vehicles', score: 'kenya' },
      { label: 'Moderate hiking through dense forest terrain', score: 'uganda' },
      { label: 'A mixture of hiking mountains, coastal tours, and wine tasting', score: 'south-africa' },
    ],
  },
];

const resultsData: Record<string, {
  name: string;
  tagline: string;
  image: string;
  highlights: string[];
  desc: string;
}> = {
  kenya: {
    name: 'Kenya Safaris',
    tagline: 'The Classic Savannah Safari Calling Your Name',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
    highlights: ['Masai Mara Game Reserves', 'Great Wildebeest Migration', 'Amboseli Elephant Drives'],
    desc: 'You dream of wide open savannahs, huge herds of elephants, and the classic safari lifestyle. Kenya is the perfect fit for your dream safari.',
  },
  uganda: {
    name: 'Uganda Safaris',
    tagline: 'The Primate & Rainforest Trekking Adventure',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    highlights: ['Gorilla Trekking in Bwindi', 'Chimpanzee Tracking in Kibale', 'Scenic River Nile Cruises'],
    desc: 'You prefer dense jungle habitats, active trekking, and rare primates. Uganda, the Pearl of Africa, will give you an unforgettable gorilla tracking experience.',
  },
  'south-africa': {
    name: 'South Africa Holidays',
    tagline: 'A Diverse Wine, Beach & Safari Journey',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
    highlights: ['Cape Town Table Mountain', 'Garden Route Coastal Drive', 'Stellenbosch Wine Country'],
    desc: 'You want a mixture of wild safaris, beautiful coastal beaches, premium vineyards, and modern city dining. South Africa has it all.',
  },
};

export default function QuizPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const startQuiz = () => {
    setStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const selectOption = (score: string) => {
    const nextAnswers = [...answers, score];
    setAnswers(nextAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final result (mode / majority vote)
      const counts: Record<string, number> = {};
      nextAnswers.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
      let recommended = 'kenya';
      let maxCount = 0;
      Object.keys(counts).forEach((key) => {
        if (counts[key] > maxCount) {
          maxCount = counts[key];
          recommended = key;
        }
      });
      setResult(recommended);
    }
  };

  const handleInquire = () => {
    navigate('/request-proposal');
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-24 pb-16 font-sans text-[#3d1f17]">
      {/* Banner */}
      <div className="relative h-[40vh] min-h-[250px] w-full overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
          alt="Safari vehicle and savannah"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4 space-y-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest">Travel Quiz</h1>
          <p className="font-accent text-xl text-[#e4a435]">Find your perfect African adventure</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {!started && (
          // Intro screen
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-auto overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80"
                alt="Jeep safari lion"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#e4a435] block">Travel Quiz</span>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-[#4a241a] leading-tight">
                  How It Works
                </h2>
                <p className="text-xs leading-relaxed text-[#6f5a52]">
                  Dreaming of the African wilderness, but not sure where to go? Whether you are after big cats on endless savannahs, gorilla treks in misty mountains, or a coastal escape after safari adventures – together we'll find your perfect destination.
                </p>
                <p className="text-xs leading-relaxed text-[#6f5a52]">
                  Simply answer a few short questions to find out whether Kenya, Uganda, or South Africa is calling your name.
                </p>
              </div>
              <button
                onClick={startQuiz}
                className="w-full py-4 bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                Start the Quiz <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {started && !result && (
          // Question card
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 md:p-12 space-y-8">
            <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400 tracking-wider">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(((currentQuestion) / quizQuestions.length) * 100)}% Complete</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-black text-[#4a241a] leading-snug">
                {quizQuestions[currentQuestion].text}
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {quizQuestions[currentQuestion].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => selectOption(opt.score)}
                  className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-primary hover:bg-[#f7f2ea] transition-all text-xs font-extrabold text-onSurface"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {started && result && (
          // Result screen
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden space-y-6">
            <div className="relative h-64 w-full">
              <img src={resultsData[result].image} alt={resultsData[result].name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#e4a435] block">Your Recommendation</span>
                <h2 className="text-3xl font-black uppercase tracking-wide">{resultsData[result].name}</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="font-accent text-2xl text-primary leading-tight">
                "{resultsData[result].tagline}"
              </p>
              <p className="text-xs leading-relaxed text-[#6f5a52]">
                {resultsData[result].desc}
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-black uppercase text-[#4a241a] tracking-wider">Destinations Highlights For You:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {resultsData[result].highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#f7f2ea] p-3 rounded-lg border border-gray-100">
                      <CheckCircle className="h-4 w-4 text-[#e4a435] shrink-0" />
                      <span className="text-[10px] font-black text-onSurface uppercase tracking-wider">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleInquire}
                  className="flex-1 py-4 bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md text-center"
                >
                  Inquire & Customize This Trip
                </button>
                <button
                  onClick={() => navigate(`/destination/${result}`)}
                  className="flex-1 py-4 bg-[#e4a435] hover:bg-[#d09228] text-[#3d1f17] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow text-center"
                >
                  View Destination Details
                </button>
                <button
                  onClick={startQuiz}
                  className="py-4 px-6 border border-gray-300 hover:bg-[#f7f2ea] text-onSurface text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" /> Retake
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
