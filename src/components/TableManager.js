import React, { useState, useEffect, useCallback} from "react";
import axios from "axios";
import "./TableManager.css"; // Uncomment if you have custom styles

const TableManager = () => {
  const [tables, setTables] = useState([]);
  const [mode, setMode] = useState({});

  // Initialize states for فەردی mode
  const [startTimesFardi, setStartTimesFardi] = useState(() => {
    const savedStartTimes = localStorage.getItem("startTimesFardi");
    return savedStartTimes ? JSON.parse(savedStartTimes) : {};
  });
  const [elapsedTimesFardi, setElapsedTimesFardi] = useState(() => {
    const savedElapsedTimes = localStorage.getItem("elapsedTimesFardi");
    return savedElapsedTimes ? JSON.parse(savedElapsedTimes) : {};
  });
  const [isRunningFardi, setIsRunningFardi] = useState(() => {
    const savedRunningStatus = localStorage.getItem("isRunningFardi");
    return savedRunningStatus ? JSON.parse(savedRunningStatus) : {};
  });

  // Initialize states for زەوجی mode
  const [startTimesZauji, setStartTimesZauji] = useState(() => {
    const savedStartTimes = localStorage.getItem("startTimesZauji");
    return savedStartTimes ? JSON.parse(savedStartTimes) : {};
  });
  const [elapsedTimesZauji, setElapsedTimesZauji] = useState(() => {
    const savedElapsedTimes = localStorage.getItem("elapsedTimesZauji");
    return savedElapsedTimes ? JSON.parse(savedElapsedTimes) : {};
  });
  const [isRunningZauji, setIsRunningZauji] = useState(() => {
    const savedRunningStatus = localStorage.getItem("isRunningZauji");
    return savedRunningStatus ? JSON.parse(savedRunningStatus) : {};
  });

  // State for prices
  const [fardiPrice, setFardiPrice] = useState(() => {
    return localStorage.getItem("fardiPrice")
      ? parseInt(localStorage.getItem("fardiPrice"))
      : 0;
  });
  const [zaujiPrice, setZaujiPrice] = useState(() => {
    return localStorage.getItem("zaujiPrice")
      ? parseInt(localStorage.getItem("zaujiPrice"))
      : 0;
  });

  // Price selection state
  const [selectedFardiPrice, setSelectedFardiPrice] = useState(fardiPrice);
  const [selectedZaujiPrice, setSelectedZaujiPrice] = useState(zaujiPrice);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const response = await axios.get(
      "https://carshopcash-production.up.railway.app/api/tables"
    );
    setTables(response.data);
  };

  const updateElapsedTimeFardi = useCallback(
    (id) => {
      if (!isRunningFardi[id]) return elapsedTimesFardi[id] || "0:0:0s"; // Return current elapsed time if not running

      const now = new Date();
      const startTime = new Date(startTimesFardi[id]);
      const elapsedMilliseconds = now - startTime;

      const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor(
        (elapsedMilliseconds / (1000 * 60)) % 60
      );
      const elapsedSeconds = Math.floor((elapsedMilliseconds / 1000) % 60);

      return `${elapsedHours}:${elapsedMinutes}:${elapsedSeconds}s`;
    },
    [elapsedTimesFardi, isRunningFardi, startTimesFardi]
  );

  const updateElapsedTimeZauji = useCallback(
    (id) => {
      if (!isRunningZauji[id]) return elapsedTimesZauji[id] || "0:0:0s"; // Return current elapsed time if not running

      const now = new Date();
      const startTime = new Date(startTimesZauji[id]);
      const elapsedMilliseconds = now - startTime;

      const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor(
        (elapsedMilliseconds / (1000 * 60)) % 60
      );
      const elapsedSeconds = Math.floor((elapsedMilliseconds / 1000) % 60);

      return `${elapsedHours}:${elapsedMinutes}:${elapsedSeconds}s`;
    },
    [elapsedTimesZauji, isRunningZauji, startTimesZauji]
  );

  // UseEffect for فەردی mode time tracking
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newElapsedTimesFardi = {};

      // Update elapsed times for فەردی
      Object.keys(startTimesFardi).forEach((id) => {
        newElapsedTimesFardi[id] = updateElapsedTimeFardi(id);
      });

      setElapsedTimesFardi(newElapsedTimesFardi);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTimesFardi, isRunningFardi, updateElapsedTimeFardi ]);

  // UseEffect for زەوجی mode time tracking
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newElapsedTimesZauji = {};

      // Update elapsed times for زەوجی
      Object.keys(startTimesZauji).forEach((id) => {
        newElapsedTimesZauji[id] = updateElapsedTimeZauji(id);
      });

      setElapsedTimesZauji(newElapsedTimesZauji);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTimesZauji, isRunningZauji, updateElapsedTimeZauji]);

  // Starting session functions
  const startSessionFardi = (id) => {
    const startTime = new Date();
    setStartTimesFardi((prev) => ({ ...prev, [id]: startTime }));
    setIsRunningFardi((prev) => ({ ...prev, [id]: true }));
  };

  const startSessionZauji = (id) => {
    const startTime = new Date();
    setStartTimesZauji((prev) => ({ ...prev, [id]: startTime }));
    setIsRunningZauji((prev) => ({ ...prev, [id]: true }));
  };

  // Clear and end session functions for فەردی
  const clearSessionFardi = (id) => {
    setStartTimesFardi((prev) => ({ ...prev, [id]: null }));
    setElapsedTimesFardi((prevTimes) => ({
      ...prevTimes,
      [id]: "0:0:0s",
    }));
    setIsRunningFardi((prev) => ({ ...prev, [id]: false }));
  };

  const endSessionFardi = (id) => {
    setIsRunningFardi((prev) => ({ ...prev, [id]: false }));
  };

  // Clear and end session functions for زەوجی
  const clearSessionZauji = (id) => {
    setStartTimesZauji((prev) => ({ ...prev, [id]: null }));
    setElapsedTimesZauji((prevTimes) => ({
      ...prevTimes,
      [id]: "0:0:0s",
    }));
    setIsRunningZauji((prev) => ({ ...prev, [id]: false }));
  };

  const endSessionZauji = (id) => {
    setIsRunningZauji((prev) => ({ ...prev, [id]: false }));
  };

  const resumeSessionZauji = (id) => {
    const now = new Date();
    const currentElapsedTime = elapsedTimesZauji[id] || "0:0:0s";

    const [hours, minutes, seconds] = currentElapsedTime
      .split(":")
      .map((time) => parseInt(time, 10));

    const totalElapsedSeconds = hours * 3600 + minutes * 60 + seconds;
    const newStartTime = new Date(now.getTime() - totalElapsedSeconds * 1000);

    setStartTimesZauji((prev) => ({ ...prev, [id]: newStartTime }));
    setIsRunningZauji((prev) => ({ ...prev, [id]: true }));
  };

  // Persisting to localStorage for فەردی and زەوجی
  useEffect(() => {
    localStorage.setItem("startTimesFardi", JSON.stringify(startTimesFardi));
    localStorage.setItem(
      "elapsedTimesFardi",
      JSON.stringify(elapsedTimesFardi)
    );
    localStorage.setItem("isRunningFardi", JSON.stringify(isRunningFardi));
    localStorage.setItem("startTimesZauji", JSON.stringify(startTimesZauji));
    localStorage.setItem(
      "elapsedTimesZauji",
      JSON.stringify(elapsedTimesZauji)
    );
    localStorage.setItem("isRunningZauji", JSON.stringify(isRunningZauji));
  }, [
    startTimesFardi,
    elapsedTimesFardi,
    isRunningFardi,
    startTimesZauji,
    elapsedTimesZauji,
    isRunningZauji,
  ]);

  const resumeSessionFardi = (id) => {
    const now = new Date();
    const elapsedTime = elapsedTimesFardi[id] || "0:0:0s";
    const [hours, minutes, seconds] = elapsedTime
      .split(":")
      .map((time) => parseInt(time, 10));

    const totalElapsedSeconds = hours * 3600 + minutes * 60 + seconds;
    const newStartTime = new Date(now.getTime() - totalElapsedSeconds * 1000);

    setStartTimesFardi((prev) => ({ ...prev, [id]: newStartTime }));
    setIsRunningFardi((prev) => ({ ...prev, [id]: true }));
  };

  const applyFardiPrice = () => {
    setFardiPrice(selectedFardiPrice);
    localStorage.setItem("fardiPrice", selectedFardiPrice);
  };

  const applyZaujiPrice = () => {
    setZaujiPrice(selectedZaujiPrice);
    localStorage.setItem("zaujiPrice", selectedZaujiPrice);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 underline text-center font-k24kurdish mt-2 font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        گەیم سەنتەری ئەتاری
      </h1>

      <hr className="mb-12" />

      {/* Price Selection Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mb-6">
        <div className="flex items-center justify-center sm:justify-start">
          <select
            value={selectedFardiPrice}
            onChange={(e) => setSelectedFardiPrice(e.target.value)}
            className="border border-gray-300 font-semibold rounded px-2 py-2 w-full sm:w-[200px] font-nrt"
          >
            <option value="3000">3000</option>
            <option value="3500">3500</option>
            <option value="4000">4000</option>
          </select>
          <button
            onClick={applyFardiPrice}
            className="bg-cyan-600 text-white border border-gray-500 rounded px-4 py-2 ml-0 sm:ml-2 mt-2 sm:mt-0 font-k24kurdish"
          >
            فەردی
          </button>
        </div>

        <div className="flex items-center justify-center sm:justify-start">
          <select
            value={selectedZaujiPrice}
            onChange={(e) => setSelectedZaujiPrice(e.target.value)}
            className="border border-gray-300 font-semibold rounded px-2 py-2 w-full sm:w-[200px] font-nrt"
          >
            <option value="0" disabled>
              نرخێک دابنێ
            </option>
            <option value="3000">3000</option>
            <option value="3500">3500</option>
            <option value="4000">4000</option>
          </select>
          <button
            onClick={applyZaujiPrice}
            className="bg-cyan-600 text-white rounded px-4 py-2 ml-0 sm:ml-2 mt-2 sm:mt-0 font-k24kurdish"
          >
            زەوجی
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white pt-4 rounded-lg shadow-md border border-slate-400 font-roboto font-bold"
          >
            <div className="flex justify-center pb-2">
              <h2 className="text-4xl text-center bg-gray-800 text-red-500 align-middle border w-12 font-k24kurdish rounded-md">
                {table.id}
              </h2>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() =>
                  setMode((prev) => ({ ...prev, [table.id]: "فەردی" }))
                }
                className={`border-2 border-indigo-600 rounded-md px-4 py-2 font-k24kurdish ${
                  mode[table.id] === "فەردی" ? "bg-blue-500 text-white" : ""
                }`}
              >
                فەردی
              </button>
              <button
                onClick={() =>
                  setMode((prev) => ({ ...prev, [table.id]: "زەوجی" }))
                }
                className={`border-2 border-indigo-600 rounded px-4 py-2 font-k24kurdish ${
                  mode[table.id] === "زەوجی" ? "bg-blue-500 text-white" : ""
                }`}
              >
                زەوجی
              </button>
            </div>

            <div className="flex flex-col mt-4">
              {mode[table.id] === "فەردی" ? (
                <>
                  <p className="text-right pr-2 font-k24kurdish text-2xl text-sky-500 mb-2">
                    {fardiPrice} : نرخ
                  </p>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg text-center w-full h-full">
                    <p className="text-5xl font-bold text-blue-500 pt-4">
                      {elapsedTimesFardi[table.id] || "0:0:0s"}
                    </p>
                    <div className="mt-4 flex">
                      {isRunningFardi[table.id] ? (
                        <button
                          onClick={() => endSessionFardi(table.id)}
                          className="bg-yellow-500 text-white rounded px-4 py-2 w-full h-auto text-xl"
                        >
                          Stop
                        </button>
                      ) : startTimesFardi[table.id] ? (
                        <>
                          <button
                            onClick={() => clearSessionFardi(table.id)}
                            className="bg-red-500 text-white px-4 py-2 w-1/2 h-auto"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => resumeSessionFardi(table.id)}
                            className="bg-blue-500 text-white px-4 py-2 w-1/2 h-auto"
                          >
                            Resume
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startSessionFardi(table.id)}
                          className="bg-green-500 text-white rounded px-4 py-2 w-full h-auto text-xl"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : mode[table.id] === "زەوجی" ? (
                <>
                  <p className="text-right pr-2 font-k24kurdish text-2xl text-sky-500 mb-2">
                    {zaujiPrice} : نرخ
                  </p>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg text-center w-full h-full">
                    <p className="text-5xl font-bold text-blue-500 pt-4">
                      {elapsedTimesZauji[table.id] || "0:0:0s"}
                    </p>
                    <div className="mt-4 flex">
                      {isRunningZauji[table.id] ? (
                        <button
                          onClick={() => endSessionZauji(table.id)}
                          className="bg-yellow-500 text-white rounded px-4 py-2 w-full h-auto text-xl"
                        >
                          Stop
                        </button>
                      ) : startTimesZauji[table.id] ? (
                        <>
                          <button
                            onClick={() => clearSessionZauji(table.id)}
                            className="bg-red-500 text-white rounded px-4 py-2 w-1/2 h-auto"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => resumeSessionZauji(table.id)}
                            className="bg-blue-500 text-white rounded px-4 py-2 w-1/2 h-auto"
                          >
                            Resume
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startSessionZauji(table.id)}
                          className="bg-green-500 text-white rounded px-4 py-2 w-full h-auto text-xl"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableManager;
