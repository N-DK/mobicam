const { Slider } = require('antd');
const { useState, useEffect } = require('react');

function SliderContainer({
    data,
    pointRouteRef,
    handleInputChange,
    rangeRef,
    pointRoute,
    value,
}) {
    const [point, setPoint] = useState(pointRouteRef);

    useEffect(() => {
        setPoint(rangeRef?.current?.value);
    }, [rangeRef?.current?.value]);

    return (
        <Slider
            min={0}
            max={data && data?.length - 1}
            value={point}
            className="w-full"
            onChange={handleInputChange}
        />
    );
}

export default SliderContainer;
