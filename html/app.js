function bytesToSize(bytes, type, i) {
    if (type == 1) {
      var sizes = ['Bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
      if (bytes == 0) return '0 Bps';
    } else if (type == 2) {
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (bytes == 0) return '0 Byte';
    }
    return { number: (bytes / Math.pow(1024, i)).toFixed(2),size: sizes[i] };
  }