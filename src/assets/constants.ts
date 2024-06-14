import { HotlineOptions, Palette } from "react-leaflet-hotline"


export const palette_0: Palette = [
    { r: 0,   g: 160, b: 0,  t: 0    },
    { r: 255, g: 255, b: 0,  t: 0.5  },
    { r: 255, g: 118, b: 0,  t: 1    }
]

export const palette_1: Palette = [
    { r: 50,  g: 50,  b: 200, t: 0   },
    { r: 50,  g: 200, b: 50,  t: 0.5 },
    { r: 200, g: 50,  b: 50,  t: 1   }
]

export const palette_2: Palette = [
    { r: 0,   g: 0,    b: 0,    t: 0   },
    { r: 6,   g: 81,   b: 98,   t: 0.5 },
    { r: 107, g: 255,  b: 107,  t: 1   },
]

export const palette_3: Palette = [
    { r: 34, g: 211, b: 238,  t: 0   },
    { r: 14, g: 165, b: 233,  t: 0.5 },
    { r: 30, g: 58,  b: 138,  t: 1   },
]


export const options: HotlineOptions = {
    min: 1,
    max: 3000,
    outlineWidth: 10,
    outlineColor: '#3c62db',
    weight: 7,
    palette: palette_0,
    tolerance: 3
}