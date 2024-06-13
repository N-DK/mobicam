import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

function TimelineRoute({ state, data }) {
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        let formattedTime = '';
        if (hours > 0) {
            formattedTime += `${hours} giờ `;
        }
        if (minutes > 0) {
            formattedTime += `${minutes} phút `;
        }
        if (seconds > 0) {
            formattedTime += `${seconds} giây`;
        }
        if (formattedTime === '') {
            formattedTime = '0 giây';
        }
        return formattedTime;
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        return `${hours}:${minutes} ${day}/${month}`;
    };

    return (
        <div>
            <div>
                <p className="font-semibold truncate">{data?.address}</p>
                <Link className="text-sm">{data?.start_gps}</Link>
                <div className="flex items-center justify-between text-xs mt-1">
                    <div>
                        <div className="flex items-center">
                            <FontAwesomeIcon
                                icon={faCalendar}
                                className="mr-1"
                            />
                            <span>
                                {formatDate(data.start_time)} -{' '}
                                {formatDate(data.end_time)}
                            </span>
                        </div>
                        {data.devid && (
                            <p className="font-semibold text-sm mt-1">
                                Km tích lũy: 0.00 km
                            </p>
                        )}
                    </div>
                    <div className="flex items-center">
                        <span className="mr-1">
                            {formatTime(data.total_time)}
                        </span>
                        <FontAwesomeIcon icon={faClock} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TimelineRoute;
