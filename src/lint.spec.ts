import {Lint, Ulint} from "./lint";
import {BufReader} from "./bufReader";
import * as _ from "lodash";


describe("Lint", () => {

    describe("static", () => {


        describe("fromBuffer()", () => {


            it("will read the expected value", () => {
                const buf = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a]);
                const lint = Lint.fromBuffer(buf, 2);
                expect(lint).toBeTruthy();
                expect(lint!.toString(16)).toEqual("a09080706050403");
            });


            it("will not read a value when the buffer is not large enough", () => {
                const buf = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
                expect(Lint.fromBuffer(buf, 2)).toEqual(undefined);
            });


        });


        describe("fromBufReader()", () => {

            it("will read the expected value", () => {
                const reader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]));
                const lint = Lint.fromBufReader(reader);
                expect(lint).toBeTruthy();
                expect(lint!.toString(16)).toEqual("807060504030201");
            });

            it("will not read a value when the reader does not have enough data", () => {
                const reader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]));
                reader.readUInt16(); // Read 0x01 and 0x02, leaving only 7 bytes
                const lint = Lint.fromBufReader(reader);
                expect(lint).toEqual(undefined);
            });

        });


        describe("fromBytesLE()", () => {


            it("will create a Lint with the expected value", () => {
                const lint = Lint.fromBytesLE([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
                expect(lint!.toString(16)).toEqual("807060504030201");
            });


        });


    });


    describe("instance", () => {


        describe("toString()", () => {


            it("will return a number in decimal by default", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Lint.fromBuffer(buf)!.toString()).toEqual("15");
            });


            it("will return a number in hexadecimal", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Lint.fromBuffer(buf)!.toString(16)).toEqual("f");
            });


            it("will return a number in decimal", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Lint.fromBuffer(buf)!.toString(10)).toEqual("15");
            });


            it("will return a number in octal", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Lint.fromBuffer(buf)!.toString(8)).toEqual("17");
            });


            it("will return a number in binary", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Lint.fromBuffer(buf)!.toString(2)).toEqual("1111");
            });


            it("will return the expected sring for the maximum value", () => {
                expect(Lint.maxValue.toString(16)).toEqual("7fffffffffffffff");
            });


            it("will return the expected sring for the minimum value", () => {
                expect(Lint.minValue.toString(16)).toEqual("-8000000000000000");
            });


        });

        describe("toNumber()", () => {

            it("will return a number", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Lint.fromBuffer(buf)!.toNumber()).toEqual(15);
            });

        });


        describe("toBuffer()", () => {


            it("will write 0 to a Buffer", () => {
                const lint = Lint.fromBuffer(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
                expect(_.isEqual(lint!.toBuffer(), Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toBeTruthy();

            });


            it("will write the minimum value to a Buffer", () => {
                expect(_.isEqual(Lint.minValue.toBuffer(), Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80]))).toBeTruthy();
            });


            it("will write the maximum value to a Buffer", () => {
                expect(_.isEqual(Lint.maxValue.toBuffer(), Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f]))).toBeTruthy();
            });


        });


    });


});


describe("Ulint", () => {


    describe("static", () => {


        describe("fromBuffer()", () => {


            it("will read the expected value", () => {
                const buf = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a]);
                const ulint = Ulint.fromBuffer(buf, 2);
                expect(ulint).toBeTruthy();
                expect(ulint!.toString(16)).toEqual("a09080706050403");
            });


            it("will not read a value when the buffer is not large enough", () => {
                const buf = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
                expect(Ulint.fromBuffer(buf, 2)).toEqual(undefined);
            });


        });


        describe("fromBufReader()", () => {

            it("will read the expected value", () => {
                const reader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]));
                const ulint = Ulint.fromBufReader(reader);
                expect(ulint).toBeTruthy();
                expect(ulint!.toString(16)).toEqual("807060504030201");
            });

            it("will not read a value when the reader does not have enough data", () => {
                const reader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]));
                reader.readUInt16(); // Read 0x01 and 0x02, leaving only 7 bytes
                const ulint = Ulint.fromBufReader(reader);
                expect(ulint).toEqual(undefined);
            });

        });


        describe("fromBytesLE()", () => {


            it("will create a Ulint with the expected value", () => {
                const ulint = Ulint.fromBytesLE([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
                expect(ulint!.toString(16)).toEqual("807060504030201");
            });


        });


    });


    describe("instance", () => {


        describe("toString()", () => {


            it("will return a number in decimal by default", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Ulint.fromBuffer(buf)!.toString()).toEqual("15");
            });


            it("will return a number in hexadecimal", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Ulint.fromBuffer(buf)!.toString(16)).toEqual("f");
            });


            it("will return a number in decimal", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Ulint.fromBuffer(buf)!.toString(10)).toEqual("15");
            });


            it("will return a number in octal", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Ulint.fromBuffer(buf)!.toString(8)).toEqual("17");
            });


            it("will return a number in binary", () => {
                const buf = Buffer.from([0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(Ulint.fromBuffer(buf)!.toString(2)).toEqual("1111");
            });


            it("will return the expected sring for the maximum value", () => {
                expect(Ulint.maxValue.toString(16)).toEqual("ffffffffffffffff");
            });


            it("will return the expected sring for the minimum value", () => {
                expect(Ulint.minValue.toString(16)).toEqual("0");
            });


        });


        describe("toBuffer()", () => {


            it("will write 0 to a Buffer", () => {
                const ulint = Ulint.fromBuffer(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
                expect(_.isEqual(ulint!.toBuffer(), Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toBeTruthy();

            });


            it("will write the minimum value to a Buffer", () => {
                expect(_.isEqual(Ulint.minValue.toBuffer(), Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toBeTruthy();
            });


            it("will write the maximum value to a Buffer", () => {
                expect(_.isEqual(Ulint.maxValue.toBuffer(), Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))).toBeTruthy();
            });


        });


    });


});
