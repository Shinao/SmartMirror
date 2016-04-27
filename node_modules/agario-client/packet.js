//this file is for internal use with packets

function Packet(e) {
    if(e instanceof Buffer) {
        this.data   = e;
        this.length = this.data.length;
    }else if((typeof Buffer) != 'undefined' && e.data instanceof Buffer) {
        this.data   = e.data;
        this.length = this.data.length;
    }else{
        this.data   = new DataView(e.data);
        this.length = this.data.byteLength;
    }

    this.offset = 0;
}

Packet.prototype = {
    readUInt8: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint8) {
            ret = this.data.getUint8(offset);
        }else{
            ret = this.data.readUInt8(offset);
        }
        if(p === undefined) this.offset += 1;

        return ret;
    },

    readUInt16BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint16) {
            ret = this.data.getUint16(offset, false);
        }else{
            ret = this.data.readUInt16BE(offset);
        }
        if(p === undefined) this.offset += 2;

        return ret;
    },

    readUInt16LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint16) {
            ret = this.data.getUint16(offset, true);
        }else{
            ret = this.data.readUInt16LE(offset);
        }
        if(p === undefined) this.offset += 2;

        return ret;
    },

    readSInt16LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getInt16) {
            ret = this.data.getInt16(offset, true);
        }else{
            ret = this.data.readInt16LE(offset);
        }
        if(p === undefined) this.offset += 2;

        return ret;
    },

    readUInt32LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint32) {
            ret = this.data.getUint32(offset, true);
        }else{
            ret = this.data.readUInt32LE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readUInt32BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint32) {
            ret = this.data.getUint32(offset, false);
        }else{
            ret = this.data.readUInt32BE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readSInt32LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getInt32) {
            ret = this.data.getInt32(offset, true);
        }else{
            ret = this.data.readInt32LE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readSInt32BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getInt32) {
            ret = this.data.getInt32(offset, false);
        }else{
            ret = this.data.readInt32BE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readFloat32LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat32) {
            ret = this.data.getFloat32(offset, true);
        }else{
            ret = this.data.readFloatLE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readFloat32BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat32) {
            ret = this.data.getFloat32(offset, false);
        }else{
            ret = this.data.readFloatBE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readFloat64LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat64) {
            ret = this.data.getFloat64(offset, true);
        }else{
            ret = this.data.readDoubleLE(offset);
        }
        if(p === undefined) this.offset += 8;

        return ret;
    },

    readFloat64BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat64) {
            ret = this.data.getFloat64(offset, false);
        }else{
            ret = this.data.readDoubleBE(offset);
        }
        if(p === undefined) this.offset += 8;

        return ret;
    },

    toString: function() {
        var out = '';
        for(var i=0;i<this.length;i++) {
            if(out) out += ' ';
            var char = this.readUInt8(i).toString(16);
            if(char.length == 1) out += '0';
            out += char;
        }

        return out;
    }
};

module.exports = Packet;

