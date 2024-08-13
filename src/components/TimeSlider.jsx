import { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import '../css/timeslider.css';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

const TimeSlider = ({ abbreviation, name, gmtOffset, onRemove, selectedDate, dragHandleProps, time, onSliderChange }) => {
    const [localTime, setLocalTime] = useState(time);
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentTime = moment.tz(moment(), name).minutes() + moment.tz(moment(), name).hours() * 60;
            setLocalTime(currentTime);
        }, 60000);

        return () => clearInterval(intervalId);
    }, [name]);

    useEffect(() => {
        onSliderChange(moment().startOf('day').minutes(localTime));
    }, [localTime, gmtOffset, name, onSliderChange]);

    const generateMarks = () => {
        const marks = [];
        for (let i = 0; i < 1440; i += 60) {
            marks.push(i);
        }
        return marks;
    };

    const convertMinutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const minutesPart = minutes % 60;
        const period = hours >= 12 ? 'pm' : 'am';
        const adjustedHours = hours % 12 === 0 ? 12 : hours % 12;
        return `${hours}:${minutesPart.toString().padStart(2, '0')}`;
    };

    const handleSliderChange = (value) => {
        setLocalTime(value);
    };

    useEffect(() => {
        setLocalTime(time);
    }, [time]);

    return (
        <div className="slider-container">
            <div className='cancelmark' onClick={onRemove}>
                <i className="fa-solid fa-xmark fa-lg" ></i>
            </div>
            <div className='timezone'>
                <div className='drag-handle' {...dragHandleProps}></div>
                <div>
                    <h2>{abbreviation}</h2>
                    <p>{name}</p>
                </div>
                <div className='time'>
                    <h2>{moment().utcOffset(gmtOffset * 60).startOf('day').minutes(localTime).format('HH:mm')}</h2>
                    <p>
                        <span>GMT {gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset}</span>
                        <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </p>
                </div>
            </div>
            <ReactSlider
                className="horizontal-slider"
                thumbClassName="thumb"
                trackClassName="track"
                min={0}
                max={1440}
                step={15}
                value={localTime}
                onChange={handleSliderChange}
                renderThumb={(props) => <div {...props}>||</div>}
                renderTrack={(props, state) => <div {...props} className={state.index === 0 ? 'active-track' : ''} />}
                renderMark={(props) => (
                    <div 
                        {...props} 
                        className={`mark ${props.key % 180 === 0 ? 'major' : props.key % 60 === 0 ? 'minor' : ''}`}
                    />
                )}
                marks={generateMarks()}
            />
            <div className="labels">
                {generateMarks().filter(mark => mark % 60 === 0).map((mark, index, array) => (
                    index < array.length && (
                        <div 
                            key={mark} 
                            className="label major" 
                            style={{ left: `${(mark / 1440) * 100}%` }}
                        >
                            {convertMinutesToTime(mark).replace(':00','')}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

TimeSlider.propTypes = {
    name: PropTypes.string.isRequired,
    abbreviation: PropTypes.string.isRequired,
    gmtOffset: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
    selectedDate: PropTypes.string.isRequired,
    dragHandleProps: PropTypes.object.isRequired,
    time: PropTypes.number.isRequired, 
    onSliderChange: PropTypes.func.isRequired,
};

export default TimeSlider;
