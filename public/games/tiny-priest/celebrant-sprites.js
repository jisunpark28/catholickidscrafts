/**
 * Celebrant pose sprites — green/purple/light_purple/pink/white chasuble variants.
 * Paths: assets/mass/characters/celebrant/{color}/{pose}.png
 */
(function initCelebrantSprites(global) {
    const POSES = [
        "idle",
        "signCross",
        "signCross_son",
        "signCross_spirit",
        "signCross_amen",
        "greet",
        "pray",
        "orans",
        "point",
        "hold",
        "lift",
        "bless",
        "peace",
        "kneel",
        "elevate_host",
        "elevate_chalice",
        "genuflect",
        "dismiss",
    ];

    const VESTMENT_COLORS = {
        green: { label: "Green", hex: 0x4d9c5a, recolorFrom: "green" },
        purple: { label: "Purple", hex: 0x6f4fa8, recolorFrom: "green" },
        light_purple: { label: "Light purple", hex: 0x9b7dc4, recolorFrom: "green" },
        pink: { label: "Pink", hex: 0xe8a0b8, recolorFrom: "green" },
        white: { label: "White", hex: 0xf7f4e8, recolorFrom: "green" },
    };

    /** Map game gesture keys → celebrant pose sprite id */
    const GESTURE_TO_POSE = {
        idle: "idle",
        signCross: "signCross",
        signCross_son: "signCross_son",
        signCross_spirit: "signCross_spirit",
        signCross_amen: "signCross_amen",
        greet: "greet",
        pray: "pray",
        ourFather: "orans",
        orans: "orans",
        point: "point",
        hold: "hold",
        lift: "lift",
        bless: "bless",
        peace: "peace",
        kneel: "kneel",
        elevate_host: "elevate_host",
        elevate_chalice: "elevate_chalice",
        genuflect: "genuflect",
        dismiss: "dismiss",
        read: "point",
    };

    /** Liturgical season colorName → vestment key */
    const SEASON_TO_VESTMENT = {
        Green: "green",
        Purple: "purple",
        White: "white",
        "Light purple": "light_purple",
        Pink: "pink",
    };

    function posePath(colorKey, poseKey) {
        return `assets/mass/characters/celebrant/${colorKey}/${poseKey}.png`;
    }

    function resolvePose(gestureKey) {
        return GESTURE_TO_POSE[gestureKey] || "idle";
    }

    function resolveVestmentFromSeason(liturgical) {
        if (!liturgical) {
            return "green";
        }
        if (liturgical.vestmentKey && VESTMENT_COLORS[liturgical.vestmentKey]) {
            return liturgical.vestmentKey;
        }
        return SEASON_TO_VESTMENT[liturgical.colorName] || "green";
    }

    global.CELEBRANT_SPRITES = {
        POSES,
        VESTMENT_COLORS,
        GESTURE_TO_POSE,
        SEASON_TO_VESTMENT,
        posePath,
        resolvePose,
        resolveVestmentFromSeason,
    };
})(typeof window !== "undefined" ? window : globalThis);
