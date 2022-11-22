import _ from "lodash";


const kilo = 1024;

////////////////////////////////////////////////////////////////////////////////

const factors = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    B:  Math.pow(kilo, 0),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    KB: Math.pow(kilo, 1),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    MB: Math.pow(kilo, 2),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GB: Math.pow(kilo, 3),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TB: Math.pow(kilo, 4),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    PB: Math.pow(kilo, 5),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    EB: Math.pow(kilo, 6),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ZB: Math.pow(kilo, 7),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    YB: Math.pow(kilo, 8)
};

type DiskSizeUnits = keyof typeof factors;

interface IDataSizeScaleItem {
    factor: number;
    units: DiskSizeUnits;
}

const scale: IDataSizeScaleItem[] = [
    { factor: factors.B,  units: "B" },
    { factor: factors.KB, units: "KB" },
    { factor: factors.MB, units: "MB" },
    { factor: factors.GB, units: "GB" },
    { factor: factors.TB, units: "TB" },
    { factor: factors.PB, units: "PB" },
    { factor: factors.EB, units: "EB" },
    { factor: factors.ZB, units: "ZB" },
    { factor: factors.YB, units: "YB" }
];


////////////////////////////////////////////////////////////////////////////////

export function kbToBytes(kb: number): number {
    return kb * factors.KB;
}

export function mbToBytes(mb: number): number {
    return _.round(mb * factors.MB);
}

export function gbToBytes(gb: number): number {
    return _.round(gb * factors.GB);
}

export function tbToBytes(tb: number): number {
    return _.round(tb * factors.TB);
}

export function pbToBytes(pb: number): number {
    return _.round(pb * factors.PB);
}

export function ebToBytes(eb: number): number {
    return _.round(eb * factors.EB);
}

export function zbToBytes(zb: number): number {
    return _.round(zb * factors.ZB);
}

export function ybToBytes(yb: number): number {
    return _.round(yb * factors.YB);
}

////////////////////////////////////////////////////////////////////////////////

export function bytesToKb(bytes: number): number {
    return bytes / factors.KB;
}

export function bytesToMb(bytes: number): number {
    return bytes / factors.MB;
}

export function bytesToGb(bytes: number): number {
    return bytes / factors.GB;
}

export function bytesToTb(bytes: number): number {
    return bytes / factors.TB;
}

export function bytesToPb(bytes: number): number {
    return bytes / factors.PB;
}

export function bytesToEb(bytes: number): number {
    return bytes / factors.EB;
}

export function bytesToZb(bytes: number): number {
    return bytes / factors.ZB;
}

export function bytesToYb(bytes: number): number {
    return bytes / factors.YB;
}

////////////////////////////////////////////////////////////////////////////////


export class StorageSize {


    public static fromBytes(bytes: number): StorageSize {
        bytes = _.round(bytes);
        return new StorageSize(bytes);
    }

    public static fromKb(kb: number): StorageSize {
        return new StorageSize(kbToBytes(kb));
    }

    public static fromMb(mb: number): StorageSize {
        return new StorageSize(mbToBytes(mb));
    }

    public static fromGb(gb: number): StorageSize {
        return new StorageSize(gbToBytes(gb));
    }

    public static fromTb(tb: number): StorageSize {
        return new StorageSize(tbToBytes(tb));
    }

    public static fromPb(pb: number): StorageSize {
        return new StorageSize(pbToBytes(pb));
    }

    public static fromEb(eb: number): StorageSize {
        return new StorageSize(ebToBytes(eb));
    }

    public static fromZb(zb: number): StorageSize {
        return new StorageSize(zbToBytes(zb));
    }

    public static fromYb(yb: number): StorageSize {
        return new StorageSize(ybToBytes(yb));
    }

    ////////////////////////////////////////////////////////////////////////////////

    private readonly _bytes: number;


    private constructor(bytes: number) {
        this._bytes = bytes;
    }

    public get bytes(): number {
        return this._bytes;
    }

    public toString(): string {

        const [val, units] = this.normalized();
        return `${val} ${units} (${this._bytes.toLocaleString()} bytes)`;
    }


    public normalized(): [val: number, units: DiskSizeUnits] {
        let curScaleItem: IDataSizeScaleItem;
        for (curScaleItem of scale) {
            if (this._bytes / curScaleItem.factor < 1000 ) {
                break;
            }
        }

        const num = _.round(this._bytes / curScaleItem!.factor, 2);
        const units = curScaleItem!.units;
        return [num, units];
    }
}
