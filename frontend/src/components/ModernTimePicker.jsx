import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, ArrowRight } from 'lucide-react';

const ModernTimePicker = ({ formData, handleFormChange, setFormData }) => {
  const [activePicker, setActivePicker] = useState(null); // 'start' or 'end'
  const pickerRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setActivePicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateDuration = () => {
    try {
      let startH = parseInt(formData.startTime.split(':')[0] || '0', 10);
      let startM = parseInt(formData.startTime.split(':')[1] || '0', 10);
      if (formData.startAmPm === 'PM' && startH !== 12) startH += 12;
      if (formData.startAmPm === 'AM' && startH === 12) startH = 0;

      let endH = parseInt(formData.endTime.split(':')[0] || '0', 10);
      let endM = parseInt(formData.endTime.split(':')[1] || '0', 10);
      if (formData.endAmPm === 'PM' && endH !== 12) endH += 12;
      if (formData.endAmPm === 'AM' && endH === 12) endH = 0;

      let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      if (hours === 0 && minutes === 0) return '0 hrs';
      if (hours === 0) return `${minutes} mins`;
      if (minutes === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
      return `${hours} hr ${minutes} m`;
    } catch (e) {
      return '--';
    }
  };

  const applyDuration = (hours) => {
    let startH = parseInt(formData.startTime.split(':')[0] || '10', 10);
    let startM = parseInt(formData.startTime.split(':')[1] || '0', 10);
    
    let isPm = formData.startAmPm === 'PM';
    if (isPm && startH !== 12) startH += 12;
    if (!isPm && startH === 12) startH = 0;

    let endTotalMinutes = (startH * 60 + startM) + (hours * 60);
    
    let endH24 = Math.floor(endTotalMinutes / 60) % 24;
    let endM = endTotalMinutes % 60;

    let endAmPm = endH24 >= 12 ? 'PM' : 'AM';
    let endH12 = endH24 % 12 || 12;

    const formattedH = endH12.toString().padStart(2, '0');
    const formattedM = endM.toString().padStart(2, '0');

    setFormData({
      ...formData,
      endTime: `${formattedH}:${formattedM}`,
      endAmPm: endAmPm
    });
  };

  const handleTimeChange = (type, field, value) => {
    if (type === 'start') {
      let timeVal = formData.startTime;
      let amPmVal = formData.startAmPm;
      
      if (field === 'hour') timeVal = `${value.padStart(2, '0')}:${timeVal.split(':')[1] || '00'}`;
      if (field === 'minute') timeVal = `${timeVal.split(':')[0] || '10'}:${value.padStart(2, '0')}`;
      if (field === 'ampm') amPmVal = value;

      setFormData(prev => ({
        ...prev,
        startTime: timeVal,
        startAmPm: amPmVal
      }));
    } else {
      let timeVal = formData.endTime;
      let amPmVal = formData.endAmPm;
      
      if (field === 'hour') timeVal = `${value.padStart(2, '0')}:${timeVal.split(':')[1] || '00'}`;
      if (field === 'minute') timeVal = `${timeVal.split(':')[0] || '04'}:${value.padStart(2, '0')}`;
      if (field === 'ampm') amPmVal = value;

      setFormData(prev => ({
        ...prev,
        endTime: timeVal,
        endAmPm: amPmVal
      }));
    }
  };

  const renderPicker = (type) => {
    const isStart = type === 'start';
    const time = isStart ? formData.startTime : formData.endTime;
    const ampm = isStart ? formData.startAmPm : formData.endAmPm;
    const h = time.split(':')[0] || '10';
    const m = time.split(':')[1] || '00';

    return (
      <div className={`absolute top-full mt-2 ${isStart ? 'left-0' : 'right-0'} bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 animate-fade-in min-w-[200px]`}>
        <div className="flex justify-between gap-2 mb-4">
          {/* Hours */}
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase text-center">Hour</span>
            <select
              size={5}
              value={parseInt(h, 10).toString()}
              onChange={(e) => handleTimeChange(type, 'hour', e.target.value)}
              className="bg-slate-800 text-white rounded-lg p-2 outline-none border border-transparent focus:border-violet-500 text-center custom-scrollbar"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="py-1">
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-center font-bold text-slate-500 pt-5">:</div>
          {/* Minutes */}
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase text-center">Min</span>
            <select
              size={5}
              value={m}
              onChange={(e) => handleTimeChange(type, 'minute', e.target.value)}
              className="bg-slate-800 text-white rounded-lg p-2 outline-none border border-transparent focus:border-violet-500 text-center custom-scrollbar"
            >
              {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(min => (
                <option key={min} value={min} className="py-1">
                  {min}
                </option>
              ))}
            </select>
          </div>
          {/* AM/PM */}
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase text-center">AM/PM</span>
            <div className="flex flex-col gap-1 h-full justify-center">
              <button 
                type="button"
                onClick={() => handleTimeChange(type, 'ampm', 'AM')}
                className={`py-2 rounded-lg text-xs font-bold transition-colors ${ampm === 'AM' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                AM
              </button>
              <button 
                type="button"
                onClick={() => handleTimeChange(type, 'ampm', 'PM')}
                className={`py-2 rounded-lg text-xs font-bold transition-colors ${ampm === 'PM' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setActivePicker(null)}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Done
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3 relative" ref={pickerRef}>
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Timing</label>
      
      {/* Time Cards Row */}
      <div className="flex items-center justify-between gap-1 sm:gap-3">
        
        {/* Start Time Card */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border transition-all ${
              activePicker === 'start' 
                ? 'bg-violet-600/10 border-violet-500/50 text-violet-400' 
                : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activePicker === 'start' ? 'text-violet-500' : 'text-slate-500'}`} />
            <span className="font-semibold tracking-wide text-[10px] sm:text-sm whitespace-nowrap">
              {formData.startTime} <span className="text-xs opacity-75">{formData.startAmPm}</span>
            </span>
            <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
          </button>
          {activePicker === 'start' && renderPicker('start')}
        </div>

        {/* Timeline connecting them */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-[60px]">
          <div className="w-full h-px bg-slate-800 absolute top-1/2 -translate-y-1/2"></div>
          <div className="bg-slate-900 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider relative z-10">
            {calculateDuration()}
          </div>
        </div>

        {/* End Time Card */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border transition-all ${
              activePicker === 'end' 
                ? 'bg-violet-600/10 border-violet-500/50 text-violet-400' 
                : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activePicker === 'end' ? 'text-violet-500' : 'text-slate-500'}`} />
            <span className="font-semibold tracking-wide text-[10px] sm:text-sm whitespace-nowrap">
              {formData.endTime} <span className="text-xs opacity-75">{formData.endAmPm}</span>
            </span>
            <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
          </button>
          {activePicker === 'end' && renderPicker('end')}
        </div>
      </div>

      {/* Quick Duration Options */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mr-1">Quick:</span>
        {[1, 2, 3, 4].map(hours => (
          <button
            key={hours}
            type="button"
            onClick={() => applyDuration(hours)}
            className="px-3 py-1 rounded-lg bg-slate-800/50 hover:bg-violet-600/20 hover:text-violet-400 text-slate-400 text-xs font-medium transition-colors border border-transparent hover:border-violet-500/30"
          >
            {hours} hr
          </button>
        ))}
      </div>

      {/* Hidden inputs to keep existing form submission working exactly as before */}
      <input type="hidden" name="startTime" value={formData.startTime} />
      <input type="hidden" name="startAmPm" value={formData.startAmPm} />
      <input type="hidden" name="endTime" value={formData.endTime} />
      <input type="hidden" name="endAmPm" value={formData.endAmPm} />
    </div>
  );
};

export default ModernTimePicker;
