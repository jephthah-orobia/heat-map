const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const drawScatterPlot = (ev) => {
    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            const dataset = data.monthlyVariance.map(o => {
                return {
                    year: o.year,
                    month: o.month - 1,
                    temp: data.baseTemperature + o.variance,
                    variance: o.variance
                };
            }), w = window.innerWidth * 0.85,
                h = window.innerHeight * 0.70,
                padding = { top: 10, bottom: 100, left: 100, right: 10 },
                months = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ];

            const xScale = d3.scaleTime()
                .range([padding.left, w - padding.right])
                .domain([new Date(1753, 0, 0), new Date(2016, 0, 0)]);

            const xAxis = d3.axisBottom(xScale);

            const yScale = d3.scaleBand()
                .domain(months)
                .range([padding.top, h - padding.bottom]);

            const yAxis = d3.axisLeft(yScale);
            /* .ticks(10 * 5)
            .tickFormat(d => d % 2000 === 0 ? d : null); */
            const barH = (h - padding.top - padding.bottom) / 12;
            const barW = xScale(new Date(2015, 0, 0)) - xScale(new Date(2014, 0, 0));

            const legP = 10;
            const legW = w * 0.8;

            const legX = padding.left + legP,
                legY = h - padding.bottom / 2;

            const tempBounds = [];
            for (let i = -4.5; i < 5; i += 1)
                tempBounds.push(data.baseTemperature + i);

            const tempScale = d3.scaleSequential()
                .domain([data.baseTemperature - 5.5, data.baseTemperature + 5.5])
                .range([legX, legX + legW]);

            const ncolorScale = d3.scaleSequential(d3.interpolate('rgb(0, 0, 255)', 'rgb(255, 255, 255)'))
                .domain([data.baseTemperature - 4.5, data.baseTemperature]);

            const pcolorScale = d3.scaleSequential(
                d3.interpolate(
                    'rgb(255, 255, 255)',
                    'rgb(255, 0, 0)'))
                .domain([data.baseTemperature, data.baseTemperature + 4.5]);
            const colW = tempScale(tempBounds[1]) - tempScale(tempBounds[0]);

            const getColor = (color) => (color == data.baseTemperature) ? 'rgb(255,255,255)' : color < data.baseTemperature ? ncolorScale(color) : pcolorScale(color);

            const tempAxis = d3.axisBottom(tempScale)
                .tickValues(tempBounds)
                .tickFormat(l => l.toFixed(1));

            d3.select("div.container")
                .append("h1")
                .attr("id", "title")
                .text('Monthly Global Land-Surface Temperature');

            d3.select("div.container")
                .append("p")
                .attr("id", "description")
                .text("1753-2015: base temparature " + data.baseTemperature);
            let svg = d3.select("div.container")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

            svg.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("class", "cell")
                .attr("height", barH)
                .attr("width", barW)
                .attr("data-index", (d, i) => i)
                .attr("data-month", d => d.month)
                .attr("data-year", d => d.year)
                .attr("data-temp", d => d.temp)
                .attr("fill", d => getColor(d.temp))
                .attr("x", d => xScale(new Date(d.year, 0, 0)))
                .attr("y", d => yScale(months[d.month]))
                .on('mouseover', function (e) {
                    let i = d3.select(this).attr("data-index");

                    d3.select("div#tooltip")
                        .style("visibility", "visible")
                        .attr("data-year", d3.select(this).attr("data-year"))
                        .style("left", (e.clientX - (w / 0.85 * 0.075)) + "px")
                        .style("top", (e.clientY) + "px");
                    d3.select("span#tt-year").text(dataset[i].year);
                    d3.select("span#tt-month").text(months[dataset[i].month]);
                    d3.select("div#tt-temp").text(dataset[i].temp.toFixed(1) + "°");
                    d3.select("div#tt-var").text(dataset[i].variance);
                })
                .on('mouseout', function (e) {
                    d3.select("div#tooltip").style("visibility", "hidden");
                });

            svg.append("g")
                .attr('id', 'x-axis')
                .attr("transform", "translate(0 ," + (h - padding.bottom) + ")")
                .call(xAxis)
                .append("text")
                .text("Years")
                .attr("class", "axisName")
                .attr("x", w / 2 + 20)
                .attr("y", 36);

            svg.append("g")
                .attr('id', 'y-axis')
                .attr("transform", "translate(" + padding.left + ", 0)")
                .call(yAxis)
                .append("text")
                .text("Months")
                .attr("class", "axisName")
                .attr("x", -(h - padding.top - padding.bottom) / 2)
                .attr("y", -padding.top * 6)
                .attr("transform", "rotate(-90)");

            svg.append("g")
                .attr('id', 'legend')
                .selectAll("rect")
                .data(tempBounds.slice(0, tempBounds.length - 1))
                .enter()
                .append("rect")
                .attr('x', d => tempScale(d))
                .attr('y', legY)
                .attr('width', colW)
                .attr('height', 20)
                .attr('fill', d => getColor(d + 0.5))
                .attr('stroke', "black");

            d3.select("g#legend")
                .append("g")
                .call(tempAxis)
                .attr('transform', "translate(0, " + (legY + 20) + ")");

            document.querySelector("#please-wait").remove();
        });
};

document.onreadystatechange = (ev) => {
    if (document.readyState === "complete")
        drawScatterPlot(ev);
}