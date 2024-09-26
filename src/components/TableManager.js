import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TableManager.css"; // Uncomment if you have custom styles

const TableManager = () => {
  const [tables, setTables] = useState([]);
  const [timers, setTimers] = useState({});
  const [elapsedTimes, setElapsedTimes] = useState({});
  const [charges, setCharges] = useState({});
  const [totalCharges, setTotalCharges] = useState({});

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const response = await axios.get("https://carshopcash-production.up.railway.app/api/tables");

    setTables(response.data);
  };

  const handleChargeChange = (id, value) => {
    setCharges((prevCharges) => ({
      ...prevCharges,
      [id]: value,
    }));
  };

  const startSession = async (id) => {
    const hourlyCharge = parseFloat(charges[id]) || 0;

    if (hourlyCharge >= 0) {
        const response = await axios.post(
            `https://carshopcash-production.up.railway.app/api/tables/${id}/start`
        );
        const table = response.data.table;

        if (table.startTime) {
            const startTime = new Date(table.startTime);
            setElapsedTimes((prevTimes) => ({
                ...prevTimes,
                [id]: "0h 0m 0s", // Initialize to 0 when starting
            }));
            clearInterval(timers[id]);
            const intervalId = setInterval(
                () => updateElapsedTime(id, startTime),
                1000
            );
            setTimers((prevTimers) => ({
                ...prevTimers,
                [id]: intervalId,
            }));
        }

        fetchTables();
    }
};


  const updateElapsedTime = (id, startTime) => {
    const now = new Date();
    const elapsedMilliseconds = now - startTime;
    const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
    const elapsedSeconds = Math.floor((elapsedMilliseconds / 1000) % 60);

    setElapsedTimes((prevTimes) => ({
      ...prevTimes,
      [id]: `${elapsedHours}h ${elapsedMinutes}m ${elapsedSeconds}s`,
    }));
  };

  const endSession = async (id) => {
    clearInterval(timers[id]);
    const hourlyCharge = parseFloat(charges[id]) || 0;

    const response = await axios.post(
      `https://carshopcash-production.up.railway.app/api/tables/${id}/end`
    );
    const totalCharge =
      hourlyCharge > 0
        ? Math.round((response.data.totalCharge / 3) * hourlyCharge)
        : 0;
    setTotalCharges((prevCharges) => ({
      ...prevCharges,
      [id]: totalCharge,
    }));

    setElapsedTimes((prevTimes) => ({
      ...prevTimes,
      [id]: null,
    }));

    setTimers((prevTimers) => ({
      ...prevTimers,
      [id]: null,
    }));

    fetchTables();
  };

  const resetCharge = async (id) => {
    const response = await axios.post(
      `https://carshopcash-production.up.railway.app/api/tables/${id}/reset`
    );
    const table = response.data.table;

    setTotalCharges((prevCharges) => ({
      ...prevCharges,
      [id]: table.totalCharge,
    }));

    setCharges((prevCharges) => ({
      ...prevCharges,
      [id]: "",
    }));

    setElapsedTimes((prevTimes) => ({
      ...prevTimes,
      [id]: null,
    }));

    clearInterval(timers[id]);
    setTimers((prevTimers) => ({
      ...prevTimers,
      [id]: null,
    }));

    fetchTables();
  };

  const formatCharge = (charge) => {
    return convertToArabicNumerals(String(charge).padStart(5, "0"));
  };

  const convertToArabicNumerals = (num) => {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(num)
      .split('')
      .map(digit => arabicNumerals[parseInt(digit, 10)])
      .join('');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-8xl mb-12 underline text-center font-k24kurdish mt-14 font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        گەیم سەنتەری ئەتاری
      </h1>
      <hr className="mb-12"/>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white p-4 rounded-lg shadow-md border border-slate-400 font-roboto font-bold"
          >
            <h2 className="text-4xl text-center text-purple-600 font-k24kurdish underline underline-offset-8 pb-3">
              مێزی {table.id}
            </h2>

            <div className="flex text-right justify-end gap-3">
              <p
                className={`font-nrt text-2xl ${
                  table.inUse ? "text-red-500" : "text-emerald-500"
                }`}
              >
                {table.inUse ? "لە بەکارهێنانایە" : "بەردەستە"}
              </p>
              <p className="text-sky-600 font-k24kurdish text-2xl"> :دۆخ</p>
            </div>

            <div className="flex justify-end text-right gap-3">
              <p className="font-nrt text-xl">
                {totalCharges[table.id] !== undefined
                  ? `  ${formatCharge(totalCharges[table.id])} دینار`
                  : "٠"}{" "}
              </p>{" "}
              {/* Total Charge Label */}
              <span className="font-k24kurdish text-cyan-500 text-2xl font-bold">
                : کۆی گشتی پارە
              </span>
            </div>

            {/* Input for hourly charge */}
            <div className="mb-4">
              {/* Input Label */}
              <h3 className="text-2xl mb-2 text-right font-k24kurdish text-blue-600">
                : کات
              </h3>
              <input
                type="number"
                dir="rtl" // Allow Arabic input
                className="border rounded w-full py-2 px-3 text-gray-700 font-nrt text-right"
                value={charges[table.id] || ""}
                onChange={(e) => handleChargeChange(table.id, e.target.value)}
                placeholder="نرخێک دابنێ بە پێی کاتژمێرێک"
                min="0"
                disabled={table.inUse}
              />
            </div>
            {table.inUse ? (
              <div className="mt-4 flex flex-col items-end">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center w-full">
                  <h3 className="text-lg font-k24kurdish">کاتژمێر</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {elapsedTimes[table.id] || "0h 0m 0s"}
                  </p>
                </div>
                <button
                  onClick={() => endSession(table.id)}
                  className="bg-red-500 text-white px-4 py-2 mt-4 rounded self-end font-k24kurdish"
                >
                  وەستاندنی کات
                </button>
              </div>
            ) : (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => startSession(table.id)}
                  className="bg-green-500 text-white px-4 py-2 mt-4 rounded font-k24kurdish"
                >
                  دەست پێکردن
                </button>
              </div>
            )}
            {totalCharges[table.id] !== undefined && (
              <div className="mt-4 flex flex-col items-end">
                <button
                  onClick={() => resetCharge(table.id)}
                  className="bg-blue-500 text-white px-4 py-2 mt-2 rounded font-k24kurdish"
                  disabled={table.inUse} // Disable when session is active
                >
                  پاککردنەوەی پارەی گشتی
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableManager;
