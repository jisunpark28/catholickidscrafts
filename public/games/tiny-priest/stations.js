/**
 * Stations of the Cross — wall placement for Tiny Priest.
 * Facing the altar (sanctuary / crucifix at negative Z):
 *   Left wall: stations 1→7 from altar toward the doors.
 *   Right wall: stations 8→14 counter-clockwise (far wall → altar end at station 14).
 *
 * sortOrder matches wall slots: 0–6 left (rows altar→doors), 7–13 right (rows altar→doors).
 */
(function (global) {
    const STATIONS_OF_THE_CROSS = [
        {
            number: 1,
            sortOrder: 0,
            title: "Station 1",
            description: "Jesus is condemned to death.",
            image: "stations/station-01.png",
        },
        {
            number: 2,
            sortOrder: 1,
            title: "Station 2",
            description: "Jesus takes up His cross.",
            image: "stations/station-02.png",
        },
        {
            number: 3,
            sortOrder: 2,
            title: "Station 3",
            description: "Jesus falls the first time.",
            image: "stations/station-03.png",
        },
        {
            number: 4,
            sortOrder: 3,
            title: "Station 4",
            description: "Jesus meets his mother.",
            image: "stations/station-04.png",
        },
        {
            number: 5,
            sortOrder: 4,
            title: "Station 5",
            description: "Simon of Cyrene helps Jesus carry the cross.",
            image: "stations/station-05.png",
        },
        {
            number: 6,
            sortOrder: 5,
            title: "Station 6",
            description: "Veronica wipes the face of Jesus.",
            image: "stations/station-06.png",
        },
        {
            number: 7,
            sortOrder: 6,
            title: "Station 7",
            description: "Jesus falls for the second time.",
            image: "stations/station-07.png",
        },
        {
            number: 8,
            sortOrder: 13,
            title: "Station 8",
            description: "Jesus meets the women of Jerusalem.",
            image: "stations/station-08.png",
        },
        {
            number: 9,
            sortOrder: 12,
            title: "Station 9",
            description: "Jesus falls for the third time.",
            image: "stations/station-09.png",
        },
        {
            number: 10,
            sortOrder: 11,
            title: "Station 10",
            description: "Jesus is stripped of his garments.",
            image: "stations/station-10.png",
        },
        {
            number: 11,
            sortOrder: 10,
            title: "Station 11",
            description: "Jesus is nailed to the cross.",
            image: "stations/station-11.png",
        },
        {
            number: 12,
            sortOrder: 9,
            title: "Station 12",
            description: "Jesus dies on the cross.",
            image: "stations/station-12.png",
        },
        {
            number: 13,
            sortOrder: 8,
            title: "Station 13",
            description: "Jesus is taken down from the cross.",
            image: "stations/station-13.png",
        },
        {
            number: 14,
            sortOrder: 7,
            title: "Station 14",
            description: "Jesus is laid in the tomb.",
            image: "stations/station-14.png",
        },
    ];

    global.STATIONS_OF_THE_CROSS = STATIONS_OF_THE_CROSS;
})(typeof window !== "undefined" ? window : globalThis);
