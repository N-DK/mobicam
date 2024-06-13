import {
    faFile,
    faMinus,
    faPause,
    faPlay,
    faPlus,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Polyline, useMap } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import {
    getListVehicles,
    getPackingRp,
    getTrackList,
} from '~/services/carService';
import styles from './Route.module.scss';
import classNames from 'classnames/bind';
import { RatioIcon, SettingIcon } from '~/icons';
import dayjs from 'dayjs';
import {
    Button,
    Collapse,
    DatePicker,
    Empty,
    Pagination,
    Select,
    Slider,
    Space,
    Spin,
    Table,
    Timeline,
} from 'antd';
import {
    SearchOutlined,
    CarFilled,
    EnvironmentFilled,
} from '@ant-design/icons';
import { RouteCar } from '~/components/RouteCar';
import { chunkArray } from '~/utils';
import { SliderContainer } from '~/components/SliderContainer';
import { TimelineRoute } from '~/components/TImelineRoute';
import { Hotline } from 'react-leaflet-hotline';
const { RangePicker } = DatePicker;

const columns = [
    {
        title: 'STT',
        dataIndex: 'no',
    },
    {
        title: 'Thời gian thiết bị',
        dataIndex: 'time',
    },
    {
        title: 'Tốc độ',
        dataIndex: 'speed',
    },
    {
        title: 'Toạ độ',
        dataIndex: 'coordinates',
        render: (text) => <a>{text}</a>,
    },
    {
        title: 'Trạng thái',
        dataIndex: 'state',
    },
    {
        title: 'KM',
        dataIndex: 'mileage',
    },
];

const speeds = [
    {
        value: '1',
        label: '1x',
    },
    {
        value: '2',
        label: '2x',
    },
    {
        value: '4',
        label: '4x',
    },
    {
        value: '8',
        label: '8x',
    },
    {
        value: '16',
        label: '16x',
    },
];

const tabs = [
    { key: 1, name: 'Dữ liệu lộ trình' },
    { key: 2, name: 'Dừng/đỗ' },
    { key: 3, name: 'Vận tốc' },
    { key: 4, name: 'Thống kê' },
];

const cx = classNames.bind(styles);

const SetMapCenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center]);
    return null;
};

function Route() {
    const [waypoints, setWaypoints] = useState();
    const [data, setData] = useState();
    const [mLvehi, setMLvehi] = useState();
    const [tabActive, setTabActive] = useState(null);
    const [pointRoute, setPointRoute] = useState(0);
    const [play, setPlay] = useState(false);
    const [speed, setSpeed] = useState(4);
    const line = useRef();
    const tabFirst = useRef(null);
    const rangeRef = useRef(null);
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(50);
    // pointRouteRef là một tham chiếu giữ giá trị hiện tại của pointRoute
    const pointRouteRef = useRef(pointRoute);
    const [center, setCenter] = useState();
    const [device, setDevice] = useState();
    const [loading, setLoading] = useState(false);
    const [parkingRp, setPackingRp] = useState();
    const [date, setDate] = useState([
        dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    ]);
    const [toggleDetails, setToggleDetails] = useState(true);

    const handleInputChange = (newValue) => {
        const value = parseInt(newValue);
        setPointRoute(value);
        pointRouteRef.current = value;
    };

    function dateTimeStringToUnixSeconds(dateTimeString) {
        let [datePart, timePart] = dateTimeString.split(' ');
        let [year, month, day] = datePart.split('-').map(Number);
        let [hours = 0, minutes = 0, seconds = 0] = (timePart || '00:00:00')
            .split(':')
            .map(Number);
        let date = new Date(year, month - 1, day, hours, minutes, seconds);
        let secondsSinceEpoch = date.getTime() / 1000;
        return secondsSinceEpoch;
    }

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (angle) => angle * (Math.PI / 180);

        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    };

    const convertDataSourceTable = (arr) => {
        return arr?.map((item, index) => {
            return {
                key: index,
                no: maxPage * page + index + 1,
                time: item.timeT,
                speed: `${item.speed} km/h`,
                coordinates: `${item.lat}, ${item.lng}`,
                state: `${item.speed > 0 ? 'Đang chạy' : 'Đang dừng'}`,
                mileage: item.mileage.toFixed(2),
            };
        });
    };

    const createStartNEndTime = (dateStrings) => {
        const firstDateTimeParts = dateStrings[0].split(' ');
        const secondDateTimeParts = dateStrings[1].split(' ');

        const startDate = firstDateTimeParts[0].replaceAll('/', '-');
        const endDate = secondDateTimeParts[0].replaceAll('/', '-');
        const startTime = firstDateTimeParts[1] || '00:00:00';
        const endTime = secondDateTimeParts[1] || '23:59:59';

        return {
            startDate,
            endDate,
            startTime,
            endTime,
        };
    };

    const handleSearch = () => {
        const [vid, devId] = device?.split('|');
        const data = {
            ...createStartNEndTime(date),
            company: 1,
            devId,
            vid,
        };

        const payloadPacking = {
            company: 1,
            endTime: dateTimeStringToUnixSeconds(
                `${createStartNEndTime(date)['endDate']} ${
                    createStartNEndTime(date)['endTime']
                }`,
            ),
            licencePlate: [vid],
            limit: 0,
            startTime: dateTimeStringToUnixSeconds(
                `${createStartNEndTime(date)['startDate']} ${
                    createStartNEndTime(date)['startTime']
                }`,
            ),
        };

        const fetch = async () => {
            try {
                setLoading(true);
                const [res, packingRpRes] = await Promise.all([
                    getTrackList(data),
                    getPackingRp(payloadPacking),
                ]);
                setPackingRp(packingRpRes?.data);
                setData(createMileageForData(res?.data));
                setWaypoints(res?.data?.map((point) => [point.lat, point.lng]));
                // setWaypoints(
                //     res?.data?.map((point) => [
                //         {
                //             lat: point.lat,
                //             lng: point.lng,
                //             speed: point.speed,
                //         },
                //     ]),
                // );
                setCenter([res?.data[0].lat, res?.data[0].lng]);
                setPlay(false);
                setPointRoute(0);
                pointRouteRef.current = 0;
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };
        fetch();
    };

    const createMileageForData = (arr) => {
        if (arr.length === 0) return arr;

        for (let i = 1; i < arr.length; i++) {
            const prevMileage = arr[i - 1].mileage;
            const distance = haversineDistance(
                arr[i - 1].lat,
                arr[i - 1].lng,
                arr[i].lat,
                arr[i].lng,
            );
            arr[i].mileage = prevMileage + distance;
        }

        return arr;
    };

    function groupByTotalTime(arr) {
        let results = [];
        let start = {
            total: arr[0]?.total_time,
            startTime: arr[0]?.start_time,
        };
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]?.address === arr[i + 1]?.address) {
                start.total += arr[i + 1]?.total_time;
            } else {
                results.push({
                    ...arr[i],
                    total_time: start.total,
                    start_time: start.startTime,
                });
                start = {
                    total: arr[i + 1]?.total_time,
                    startTime: arr[i + 1]?.start_time,
                };
            }
        }

        var newArray = [];
        for (let i = 0; i < results.length; i++) {
            newArray.push(results[i]);
            const total = results[i]?.total_time + results[i + 1]?.total_time;
            const km = results[i]?.speed * total;
            newArray.push({
                address: `${km} km di chuyển`,
                start_time: results[i].end_time,
                end_time: results[i + 1]?.start_time,
                total_time: total,
            });
        }

        return results;

        let grouped = {};
        arr.forEach((item) => {
            let key = item.address;
            if (!grouped[key]) {
                grouped[key] = {
                    ...item,
                    total_time: 0,
                };
            }
            grouped[key].total_time += item.total_time;
        });

        let result = Object.values(grouped);
        return result;
    }

    useEffect(() => {
        const fetch = async () => {
            try {
                const [mLvehiRes] = await Promise.all([getListVehicles()]);
                setMLvehi(mLvehiRes?.data);
                setCenter([mLvehiRes?.data[0].lat, mLvehiRes?.data[0].lng]);
            } catch (error) {
                console.error(error);
            }
        };
        fetch();
    }, []);

    useEffect(() => {
        if (tabActive && line.current) {
            const { offsetWidth, offsetLeft } = tabActive;
            line.current.style.width = `${offsetWidth}px`;
            line.current.style.transform = `translateX(${offsetLeft}px)`;
        }
    }, [tabActive]);

    useEffect(() => {
        if (tabFirst.current) {
            setTabActive(tabFirst.current);
        }
    }, [tabFirst]);

    return (
        <div className="h-full">
            <div className="h-full flex pt-12">
                {/* left */}
                <div className="w-[370px] bg-white shadow h-full pl-1 pr-1">
                    <div className="flex flex-col h-full">
                        <div className="h-20 pt-1">
                            <Space direction="vertical" size={12}>
                                <RangePicker
                                    format="YYYY/MM/DD HH:mm:ss"
                                    defaultValue={[
                                        dayjs().startOf('day'),
                                        dayjs().endOf('day'),
                                    ]}
                                    placeholder={[
                                        'Ngày bắt đầu',
                                        'Ngày kết thúc',
                                    ]}
                                    style={{ borderRadius: 0 }}
                                    showTime
                                    onChange={(dates, dateStrings) =>
                                        setDate(dateStrings)
                                    }
                                />
                            </Space>
                            <div className="flex items-center justify-between mt-1">
                                <div className="w-8/12 mr-1 relative">
                                    <Select
                                        showSearch
                                        style={{
                                            borderRadius: 2,
                                            width: '100%',
                                        }}
                                        placeholder="Chọn phương tiện"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').includes(
                                                input,
                                            )
                                        }
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.label ?? '')
                                                .toLowerCase()
                                                .localeCompare(
                                                    (
                                                        optionB?.label ?? ''
                                                    ).toLowerCase(),
                                                )
                                        }
                                        options={mLvehi?.map((v) => {
                                            return {
                                                value: `${v.name_Vid}|${v.devId}`,
                                                label: `${v.name_Vid} (${v.name_Vid}) (${v.devId})`,
                                            };
                                        })}
                                        onChange={(value) => setDevice(value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    type="primary"
                                    className="flex-1"
                                    style={{ borderRadius: 2 }}
                                    icon={<SearchOutlined />}
                                    loading={loading}
                                >
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 bg-gray relative">
                            {loading ? (
                                <div className="absolute top-0 left-0 right-0 bottom-0  bg-white-opacity-main  bg-opacity-70 flex justify-center items-center z-[9999999]">
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 h-[500px] overflow-y-auto">
                                        <div className="h-[300px]">
                                            <Collapse
                                                style={{ borderRadius: 0 }}
                                                defaultActiveKey={1}
                                                items={[
                                                    {
                                                        key: '1',
                                                        label: 'Lộ trình',
                                                        children: (
                                                            <>
                                                                {data ? (
                                                                    <Timeline
                                                                        items={groupByTotalTime(
                                                                            parkingRp,
                                                                        )?.map(
                                                                            (
                                                                                data,
                                                                                index,
                                                                            ) => {
                                                                                if (
                                                                                    data.total_time >=
                                                                                    300
                                                                                ) {
                                                                                    return {
                                                                                        dot: (
                                                                                            <div className="flex w-5 h-5 rounded-sm justify-center bg-[#e74b3c] items-center text-white ">
                                                                                                <span>
                                                                                                    <EnvironmentFilled />
                                                                                                </span>
                                                                                            </div>
                                                                                        ),
                                                                                        children:
                                                                                            (
                                                                                                <TimelineRoute
                                                                                                    state={
                                                                                                        'STOP'
                                                                                                    }
                                                                                                    data={
                                                                                                        data
                                                                                                    }
                                                                                                />
                                                                                            ),
                                                                                    };
                                                                                }
                                                                            },
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    <Empty
                                                                        description="Trống"
                                                                        image={
                                                                            Empty.PRESENTED_IMAGE_SIMPLE
                                                                        }
                                                                    />
                                                                )}
                                                            </>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col bottom-0 right-0 left-0">
                                        <Collapse
                                            accordion={true}
                                            style={{
                                                borderRadius: 0,
                                            }}
                                            defaultActiveKey={1}
                                            items={[
                                                {
                                                    key: '1',
                                                    label: 'Tổng hợp',
                                                    children: (
                                                        <>
                                                            {parkingRp ? (
                                                                <div className="h-full">
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Quãng
                                                                            đường
                                                                            đi
                                                                            được:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {data[
                                                                                data.length -
                                                                                    1
                                                                            ].mileage.toFixed(
                                                                                2,
                                                                            )}
                                                                            km
                                                                        </span>
                                                                    </p>
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Số
                                                                            lần
                                                                            dừng
                                                                            đỗ:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {`${parkingRp.length} lần`}
                                                                        </span>
                                                                    </p>
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Tổng
                                                                            thời
                                                                            gian
                                                                            dừng
                                                                            đỗ:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            8
                                                                            giờ
                                                                            9
                                                                            phút
                                                                        </span>
                                                                    </p>
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Nhiên
                                                                            liệu
                                                                            tiêu
                                                                            thụ:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            0.00
                                                                            lít
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <Empty
                                                                    description="Trống"
                                                                    image={
                                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                                    }
                                                                />
                                                            )}
                                                        </>
                                                    ),
                                                },
                                            ]}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* right */}
                <div className="flex-1 flex relative">
                    {/* Main */}
                    {mLvehi && (
                        <div className="w-full">
                            <MapContainer
                                center={
                                    mLvehi && [mLvehi[0].lat, mLvehi[0].lng]
                                }
                                zoom={13}
                                scrollWheelZoom={true}
                                zoomControl={false}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <SetMapCenter
                                    center={
                                        center
                                            ? center
                                            : [mLvehi[0].lat, mLvehi[0].lng]
                                    }
                                />
                                <ReactLeafletGoogleLayer
                                    apiKey="AIzaSyA8A9yPeigR3I485ayAHKniugLw3OqXlS4"
                                    type={'satellite'}
                                />
                                {waypoints && data && (
                                    <>
                                        <Polyline
                                            positions={waypoints}
                                            color="#cae84a"
                                            weight={6}
                                        />

                                        {/* <Hotline
                                            data={waypoints}
                                            getLat={(point) => point.lat}
                                            getLng={(point) => point.lng}
                                            getVal={(point) => point.speed}
                                            options={{
                                                min: Math.min(
                                                    ...data?.map(
                                                        (point) => point.speed,
                                                    ),
                                                ),
                                                max: Math.max(
                                                    ...data?.map(
                                                        (point) => point.speed,
                                                    ),
                                                ),
                                                weight: 10,
                                                outlineWidth: 1,
                                                outlineColor: '#cae84a',
                                                palette: [
                                                    {
                                                        r: 0,
                                                        g: 255,
                                                        b: 0,
                                                        t: 0,
                                                    }, // green
                                                    {
                                                        r: 255,
                                                        g: 255,
                                                        b: 0,
                                                        t: 0.5,
                                                    }, // yellow
                                                    {
                                                        r: 255,
                                                        g: 0,
                                                        b: 0,
                                                        t: 1,
                                                    }, // red
                                                ],
                                                // palette: [],
                                            }}
                                        /> */}
                                        <RouteCar
                                            props={{
                                                data: data,
                                                pointRoute: pointRoute,
                                                speed: speed,
                                                play: play,
                                                pointRouteRef: pointRouteRef,
                                                rangeRef: rangeRef,
                                                maxPage: maxPage,
                                                setPage: setPage,
                                            }}
                                        />
                                    </>
                                )}
                            </MapContainer>
                        </div>
                    )}

                    <div
                        className={`absolute z-1000 bg-white bottom-0 ${
                            toggleDetails ? 'h-[280px]' : 'h-10'
                        } right-0 w-full text-sm transition-all`}
                    >
                        {loading ? (
                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white-opacity-main  bg-opacity-70 flex justify-center items-center z-[9999999]">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div>
                                {/* Header */}
                                <div className="flex items-center justify-between border-b p-1">
                                    <div className="flex items-center text-sm relative">
                                        {tabs.map((tab) => (
                                            <div
                                                key={tab.key}
                                                data-node-key={tab.key}
                                                ref={
                                                    tab.key === 1
                                                        ? tabFirst
                                                        : null
                                                }
                                                onClick={(e) =>
                                                    setTabActive(
                                                        e.currentTarget,
                                                    )
                                                }
                                                className={`${
                                                    Number(
                                                        tabActive?.getAttribute(
                                                            'data-node-key',
                                                        ),
                                                    ) === tab.key &&
                                                    'text-blue-500'
                                                } mr-7 cursor-pointer text-xxs`}
                                            >
                                                <span>{tab.name}</span>
                                            </div>
                                        ))}
                                        <span
                                            ref={line}
                                            className={`${cx('line')}`}
                                        ></span>
                                    </div>
                                    <button
                                        onClick={() => setToggleDetails(false)}
                                        className="rounded bg-red-400 w-7 h-7 text-white"
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                                {/* Body */}
                                <div>
                                    <div
                                        className={`${cx(
                                            'bg',
                                        )} flex justify-between items-center h-9 pl-2 pr-2 text-xxs`}
                                    >
                                        <Pagination
                                            className="text-xxs"
                                            locale={{
                                                items_per_page: '/ trang',
                                            }}
                                            size="small"
                                            total={data ? data.length : 0}
                                            showTotal={(total) =>
                                                `Tổng ${total}`
                                            }
                                            showSizeChanger
                                            defaultPageSize={50}
                                            current={page + 1}
                                            defaultCurrent={1}
                                            onChange={(pageNumber) =>
                                                setPage(pageNumber - 1)
                                            }
                                            onShowSizeChange={(current, size) =>
                                                setMaxPage(size)
                                            }
                                        />
                                        <div className="flex items-center">
                                            <Button className="rounded p-2 bg-blue-500 text-white text-xs pl-3 pr-3">
                                                <FontAwesomeIcon
                                                    icon={faFile}
                                                />
                                                <span>Excel</span>
                                            </Button>
                                            <button className="ml-1 bg-white p-1 rounded">
                                                <RatioIcon />
                                            </button>
                                            <button className="ml-1 bg-white p-1 rounded">
                                                <SettingIcon />
                                            </button>
                                        </div>
                                    </div>
                                    {/* table */}
                                    <div>
                                        <Table
                                            size="small"
                                            fixed={true}
                                            columns={columns}
                                            dataSource={convertDataSourceTable(
                                                chunkArray(data, maxPage)[page],
                                            )}
                                            bordered
                                            pagination={false}
                                            scroll={{
                                                y: 136,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {!toggleDetails && (
                            <Button
                                onClick={() => setToggleDetails(true)}
                                className="rounded-sm p-2 bg-blue-500 text-white text-xs pl-3 pr-3 absolute bottom-12 left-4"
                            >
                                Xem chi tiết
                            </Button>
                        )}
                        {/* Footer */}
                        <div className="h-10 absolute bottom-0 right-0 left-0 w-full bg-white border pl-3 pr-3">
                            <div className="flex w-full items-center h-full">
                                <div className="mr-2">
                                    <button
                                        onClick={() => setPlay(!play)}
                                        className="border w-8 h-8 mr-2"
                                    >
                                        <FontAwesomeIcon
                                            icon={play ? faPause : faPlay}
                                        />
                                    </button>
                                    <Select
                                        defaultValue={`${speed}`}
                                        style={{
                                            width: 80,
                                        }}
                                        onChange={(value) => {
                                            setSpeed(Number(value));
                                        }}
                                        options={speeds}
                                    />
                                </div>
                                <div className="flex-1 mr-4">
                                    {/* <input
                                        ref={rangeRef}
                                        value={pointRouteRef.current}
                                        type="range"
                                        min={0}
                                        max={data && data?.length - 1}
                                        className="w-full"
                                        onChange={handleInputChange}
                                    /> */}
                                    <Slider
                                        min={0}
                                        max={data && data?.length - 1}
                                        // ref={rangeRef}
                                        value={pointRouteRef.current}
                                        className="w-full"
                                        onChange={handleInputChange}
                                    />
                                    {/* <SliderContainer
                                        data={data}
                                        pointRouteRef={pointRouteRef.current}
                                        pointRoute={pointRoute}
                                        handleInputChange={handleInputChange}
                                        rangeRef={rangeRef}
                                        value={rangeRef?.current?.value}
                                    /> */}
                                </div>
                                <div className="flex items-center">
                                    <button className="w-8 h-8 border mr-2">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button className="w-8 h-8 border mr-2">
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <button className="w-8 h-8 border flex items-center justify-center">
                                        <SettingIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Route;
