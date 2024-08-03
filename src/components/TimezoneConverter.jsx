import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/timezoneConverter.css';
import TimeSlider from './TimeSlider';
import timezones from '../data/timezones';
import moment from 'moment-timezone';

const formatTime = (time, timezone) => {
    const localDate = moment.tz(time, timezone);
    const formattedTime = localDate.format('h:mm A');
    const formattedDayDate = localDate.format('ddd MMM D');
    return { formattedTime, formattedDayDate };
};

const TimezoneConverter = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const datePickerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(moment());
    const [timeZones, setTimeZones] = useState([
        {
            id: '1',
            abbreviation: 'IST',
            name: 'Indian Standard Time',
            gmtOffset: 5.5,
            timezone: 'Asia/Kolkata',
            formattedTime: formatTime(moment(), 'Asia/Kolkata'),
            time: moment.tz(moment(), 'Asia/Kolkata').minutes() + moment.tz(moment(), 'Asia/Kolkata').hours() * 60,
        },
        {
            id: '2',
            abbreviation: 'UTC',
            name: 'Coordinated Universal Time',
            gmtOffset: 0,
            timezone: 'UTC',
            formattedTime: formatTime(moment(), 'UTC'),
            time: moment.tz(moment(), 'UTC').minutes() + moment.tz(moment(), 'UTC').hours() * 60,
        },
    ]);
    const [generatedLink, setGeneratedLink] = useState('');
    const [isLinkVisible, setIsLinkVisible] = useState(false);

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
    };

    const handleRemove = (index) => {
        const newTimezones = [...timeZones];
        newTimezones.splice(index, 1);
        setTimeZones(newTimezones);
        updateLink(newTimezones);
    };

    const handleIconClick = () => {
        datePickerRef.current.setOpen(true);
    };

    const reverseTimezones = () => {
        const reversedTimezones = [...timeZones].reverse();
        setTimeZones(reversedTimezones);
        updateLink(reversedTimezones);
    };

    const handleSelectChange = (event) => {
        const selectedAbbreviation = event.target.value;
        const foundTimezone = timezones.find((tz) => tz.abbreviation === selectedAbbreviation);
        if (foundTimezone) {
            const newTimezone = {
                id: Date.now().toString(),
                ...foundTimezone,
                formattedTime: formatTime(currentTime, foundTimezone.timezone),
                time: moment.tz(moment(), foundTimezone.timezone).minutes() + moment.tz(moment(), foundTimezone.timezone).hours() * 60,
            };
            const newTimezones = [...timeZones, newTimezone];
            setTimeZones(newTimezones);
            updateLink(newTimezones);
        }
    };

    const updateLink = (timeZones) => {
        const params = timeZones.map(tz => tz.abbreviation).join(',');
        const url = `https://timezone-converter-nfi.vercel.app/?timezones=${params}`;
        setGeneratedLink(url);
    };

    const toggleLinkVisibility = () => {
        setIsLinkVisible(!isLinkVisible);
    };

    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination) return;

        const reorderedTimeZones = Array.from(timeZones);
        const [moved] = reorderedTimeZones.splice(source.index, 1);
        reorderedTimeZones.splice(destination.index, 0, moved);
        setTimeZones(reorderedTimeZones);
        updateLink(reorderedTimeZones);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const timezonesParam = urlParams.get('timezones');
        if (timezonesParam) {
            const tzAbbreviations = timezonesParam.split(',');
            const newTimezones = tzAbbreviations.map((abbr) => {
                const foundTimezone = timezones.find((tz) => tz.abbreviation === abbr);
                if (foundTimezone) {
                    return {
                        id: Date.now().toString(),
                        ...foundTimezone,
                        formattedTime: formatTime(currentTime, foundTimezone.timezone),
                        time: moment.tz(moment(), foundTimezone.timezone).minutes() + moment.tz(moment(), foundTimezone.timezone).hours() * 60,
                    };
                }
                return null;
            }).filter(Boolean);
            setTimeZones(newTimezones);
        }
    }, []);

    useEffect(() => {
        const updatedTimeZones = timeZones.map(tz => ({
            ...tz,
            formattedTime: formatTime(currentTime, tz.timezone),
        }));
        setTimeZones(updatedTimeZones);
    }, [currentTime]);

    const handleSliderChange = (time) => {
        setCurrentTime(time);
        const updatedTimeZones = timeZones.map(tz => ({
            ...tz,
            time: moment.tz(time, tz.timezone).minutes() + moment.tz(time, tz.timezone).hours() * 60,
            formattedTime: formatTime(time, tz.timezone),
        }));
        setTimeZones(updatedTimeZones);
    };

    return (
        <div className={`container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
            <h1>Timezone Converter</h1>
            <div className='header'>
                <div className='top'>
                    <div className="add">
                        <select onChange={handleSelectChange} defaultValue="">
                            <option value="" disabled>
                                Add Time Zone, City, or Town
                            </option>
                            {timezones.map((timezone) => (
                                <option key={timezone.abbreviation} value={timezone.abbreviation}>
                                    {timezone.name} ({timezone.gmtOffset})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='datepicker'>
                        <ReactDatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="MMM d, yyyy"
                            className='dateinput'
                            ref={datePickerRef}
                        />
                        <i className="fa-regular fa-calendar-days fa-xl calendar" onClick={handleIconClick}></i>
                    </div>
                    <div className='icons'>
                        <button>
                            <i className="fa-solid fa-calendar-plus fa-xl"></i>
                        </button>
                        <button onClick={reverseTimezones}>
                            <i className="fa-solid fa-arrow-up-long fa-xl"></i>
                            <i className="fa-solid fa-arrow-down-long fa-xl"></i>
                        </button>
                        <button onClick={toggleLinkVisibility}>
                            <i className="fa-solid fa-link fa-xl"></i>
                        </button>
                        <button onClick={toggleTheme}>
                            {isDarkTheme ? (
                                <i className="fa-solid fa-sun fa-xl"></i>
                            ) : (
                                <i className="fa-solid fa-moon fa-xl"></i>
                            )}
                        </button>
                    </div>
                   
                </div>
                <div className='bottom'>
                        {isLinkVisible && generatedLink && (
                            <div className="link-box">
                                <p>{generatedLink}</p>
                            </div>
                        )}
                    </div>
            </div>


            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className='drop-target'
                        >
                            {timeZones.map((tz, index) => (
                                <Draggable key={tz.id} draggableId={tz.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <TimeSlider
                                                abbreviation={tz.abbreviation}
                                                name={tz.name}
                                                gmtOffset={tz.gmtOffset}
                                                formatTime={tz.formattedTime}
                                                onRemove={() => handleRemove(index)}
                                                selectedDate={selectedDate}
                                                dragHandleProps={provided.dragHandleProps} // Pass dragHandleProps
                                                time={tz.time} // Pass the time prop
                                                onSliderChange={handleSliderChange} // Pass the handleSliderChange function
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default TimezoneConverter;
