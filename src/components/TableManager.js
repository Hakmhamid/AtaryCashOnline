import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./TableManager.css"; // Uncomment if you have custom styles

const TableManager = () => {
  const [tables, setTables] = useState([]);
  // Retrieve mode state from localStorage or initialize as empty object
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("mode");
    return savedMode ? JSON.parse(savedMode) : {};
  });

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

  const [livePriceFardi, setLivePriceFardi] = useState({}); // Live price for فەردی
  const [livePriceZauji, setLivePriceZauji] = useState({}); // Live price for زەوجی

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    localStorage.setItem("mode", JSON.stringify(mode));
  }, [mode]);

  const fetchTables = async () => {
    const response = await axios.get(
      "https://carshopcash-production.up.railway.app/api/tables"
    );
    setTables(response.data);
  };

  const calculateLivePrice = (elapsedTime, pricePerHour) => {
    const [hours, minutes, seconds] = elapsedTime
      .split(":")
      .map((time) => parseInt(time, 10));
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const pricePerSecond = pricePerHour / 3600;
    return Math.floor(totalSeconds * pricePerSecond);
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

      const elapsedTimeString = `${elapsedHours}:${elapsedMinutes}:${elapsedSeconds}s`;

      // Update live price based on elapsed time and selected price
      const newPrice = calculateLivePrice(
        elapsedTimeString,
        selectedFardiPrice
      );
      setLivePriceFardi((prev) => ({ ...prev, [id]: newPrice }));

      return elapsedTimeString;
    },
    [elapsedTimesFardi, isRunningFardi, startTimesFardi, selectedFardiPrice]
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

      const elapsedTimeString = `${elapsedHours}:${elapsedMinutes}:${elapsedSeconds}s`;

      // Update live price based on elapsed time and selected price
      const newPrice = calculateLivePrice(
        elapsedTimeString,
        selectedZaujiPrice
      );
      setLivePriceZauji((prev) => ({ ...prev, [id]: newPrice }));

      return elapsedTimeString;
    },
    [elapsedTimesZauji, isRunningZauji, startTimesZauji, selectedZaujiPrice]
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
  }, [startTimesFardi, isRunningFardi, updateElapsedTimeFardi]);

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
    // Reset elapsed time and live price
    setElapsedTimesFardi((prev) => ({ ...prev, [id]: "0:0:0s" }));
    setLivePriceFardi((prev) => ({ ...prev, [id]: 0 }));
  };

  const startSessionZauji = (id) => {
    const startTime = new Date();
    setStartTimesZauji((prev) => ({ ...prev, [id]: startTime }));
    setIsRunningZauji((prev) => ({ ...prev, [id]: true }));
    // Reset elapsed time and live price
    setElapsedTimesZauji((prev) => ({ ...prev, [id]: "0:0:0s" }));
    setLivePriceZauji((prev) => ({ ...prev, [id]: 0 }));
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
    localStorage.setItem("mode", JSON.stringify(mode));
  }, [
    startTimesFardi,
    elapsedTimesFardi,
    isRunningFardi,
    startTimesZauji,
    elapsedTimesZauji,
    isRunningZauji,
    mode,
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
    <>
      <div className="container mx-auto ">
        <h1 className="text-4xl sm:text-6xl md:text-7xl bg-slate-400 lg:text-8xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center font-k24kurdish mt-2 font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          گەیم سەنتەری ئەتاری
        </h1>
      </div>
      <div className="bg-gradient-to-r from bg-gray-400 to-gray-600 ">
        <hr className="mb-12" />
        <div className="container mx-auto">
          {/* Price Selection Dropdowns */}
          <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mb-6 ">
            <div className="flex items-center justify-center sm:justify-start">
              <select
                value={selectedFardiPrice}
                onChange={(e) =>
                  setSelectedFardiPrice(parseInt(e.target.value))
                }
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
                onChange={(e) =>
                  setSelectedZaujiPrice(parseInt(e.target.value))
                }
                className="border border-gray-300 font-semibold rounded px-2 py-2 w-full sm:w-[200px] font-nrt"
              >
                <option value="6000">6000</option>
                <option value="6500">6500</option>
                <option value="7000">7000</option>
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
                className="bg-white pt-4 rounded-lg shadow-md border border-white font-roboto font-bold"
              >
                <div className="flex justify-center pb-2">
                  <h2 className="text-4xl text-center bg-gray-800 text-red-500 align-middle border w-12 font-k24kurdish rounded-md">
                    {table.id}
                  </h2>
                </div>

                <div className="flex">
                  {/* Conditional rendering based on the selected mode */}
                  {mode[table.id] !== "فەردی" && mode[table.id] !== "زەوجی" && (
                    <>
                      <button
                        onClick={() => {
                          setMode((prev) => ({ ...prev, [table.id]: "فەردی" }));
                          startSessionFardi(table.id);
                        }}
                        className="border-2 border-indigo-600 rounded-md px-4 py-2 font-k24kurdish w-1/2"
                      >
                        فەردی
                      </button>
                      <button
                        onClick={() => {
                          setMode((prev) => ({ ...prev, [table.id]: "زەوجی" }));
                          startSessionZauji(table.id);
                        }}
                        className="border-2 border-indigo-600 rounded px-4 py-2 font-k24kurdish w-1/2"
                      >
                        زەوجی
                      </button>
                    </>
                  )}

                  {mode[table.id] === "فەردی" && (
                    <button
                      onClick={() => {
                        // Update mode and start session
                        setMode((prev) => ({ ...prev, [table.id]: null }));
                      }}
                      className="border-2 border-indigo-600 bg-blue-500 text-white text-xl rounded-md px-4 py-2 font-k24kurdish w-full"
                    >
                      فەردی
                    </button>
                  )}

                  {mode[table.id] === "زەوجی" && (
                    <button
                      onClick={() => {
                        // Update mode and start session
                        setMode((prev) => ({ ...prev, [table.id]: null }));
                      }}
                      className="border-2 border-indigo-600 bg-gradient-to-r from-emerald-600 to-lime-600 text-white text-xl rounded-md px-4 py-2 font-k24kurdish w-full"
                    >
                      زەوجی
                    </button>
                  )}
                </div>

                <div className="flex flex-col mt-4">
                  {mode[table.id] === "فەردی" ? (
                    <>
                      <div className="flex flex-row-reverse justify-between px-2">
                        <p className="text-right font-k24kurdish text-2xl text-sky-500 mb-2">
                          {fardiPrice} : نرخ
                        </p>
                        <div className="flex flex-row-reverse gap-2 align-middle">
                          <p className="text-right pr-2 font-k24kurdish text-2xl text-sky-500 mb-2">
                            {livePriceFardi[table.id]}
                          </p>
                          <span className="font-k24kurdish text-2xl text-sky-500 mb-2">
                            دینار
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-100 border border-gray-300 rounded-lg text-center w-full h-full">
                        <p className="text-5xl font-bold text-blue-500 pt-4">
                          {elapsedTimesFardi[table.id] || "0:0:0s"}
                        </p>
                        <div className="mt-4 flex">
                          {isRunningFardi[table.id] ? (
                            <button
                              onClick={() => endSessionFardi(table.id)}
                              className="bg-red-500 text-white rounded px-4 py-2 w-full h-auto text-xl"
                            >
                              Stop
                            </button>
                          ) : startTimesFardi[table.id] ? (
                            <>
                              <button
                                onClick={() => {
                                  clearSessionFardi(table.id);
                                  // Reset mode to null (show فەردی and زەوجی buttons)
                                  setMode((prev) => ({
                                    ...prev,
                                    [table.id]: null,
                                  }));
                                }}
                                className="bg-yellow-500 text-white px-4 py-2 w-1/2 h-auto"
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
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : mode[table.id] === "زەوجی" ? (
                    <>
                      <div className="flex flex-row-reverse justify-between px-2">
                        <p className="text-right font-k24kurdish text-2xl text-sky-500 mb-2">
                          {zaujiPrice} : نرخ
                        </p>
                        <div className="flex flex-row-reverse gap-2 align-middle">
                          <p className="text-right font-k24kurdish text-2xl text-sky-500 mb-2">
                            {livePriceZauji[table.id]}
                          </p>
                          <span className="font-k24kurdish text-2xl text-sky-500 mb-2">
                            دینار
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-100 border border-gray-300 rounded-lg text-center w-full h-full">
                        <p className="text-5xl font-bold text-blue-500 pt-4">
                          {elapsedTimesZauji[table.id] || "0:0:0s"}
                        </p>
                        <div className="mt-4 flex">
                          {isRunningZauji[table.id] ? (
                            <button
                              onClick={() => endSessionZauji(table.id)}
                              className="bg-red-500 text-white rounded px-4 py-2 w-full h-auto text-xl"
                            >
                              Stop
                            </button>
                          ) : startTimesZauji[table.id] ? (
                            <>
                              <button
                                onClick={() => {
                                  clearSessionZauji(table.id);
                                  // Reset mode to null (show فەردی and زەوجی buttons)
                                  setMode((prev) => ({
                                    ...prev,
                                    [table.id]: null,
                                  }));
                                }}
                                className="bg-yellow-500 text-white px-4 py-2 w-1/2 h-auto"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => resumeSessionZauji(table.id)}
                                className="bg-blue-500 text-white px-4 py-2 w-1/2 h-auto"
                              >
                                Resume
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TableManager;
