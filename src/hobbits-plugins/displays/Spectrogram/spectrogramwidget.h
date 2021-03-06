#ifndef SPECTROGRAMWIDGET_H
#define SPECTROGRAMWIDGET_H

#include "displaybase.h"
#include "fftw3.h"

class SpectrogramWidget : public DisplayBase
{
    Q_OBJECT

public:
    enum WordFormat {
        Unsigned = 0x00,
        TwosComplement = 0x01,
        BigEndian = 0x00,
        LittleEndian = 0x10
    };

    enum DataType {
        Real = 1,
        RealComplexInterleaved = 2
    };

    SpectrogramWidget(
            QSharedPointer<DisplayHandle> displayHandle,
            DisplayInterface *pluginRef,
            QWidget *parent = nullptr);

    void paintEvent(QPaintEvent*) override;
    void mouseMoveEvent(QMouseEvent *event) override;

public slots:
    void setScale(int);
    void setOverlap(int);
    void setFftSize(int);
    void setWordSize(int);
    void setWordFormat(int);
    void setDataType(int);
    void setSensitivity(double);
    void setSampleRate(double);
    void setShowHeaders(bool);

private:
    int bitStride();
    void fillSamples(fftw_complex* buffer, int sampleCount, qint64 bitOffset, QSharedPointer<BitContainer> container);
    QList<QVector<double>> computeStft(int maxSpectrums, qint64 bitOffset, QSharedPointer<BitContainer> container);
    void prepareHeaders();
    QString timeString(qint64 sample);

    int m_scale;
    bool m_showFrameOffsets;
    bool m_showColumnOffsets;

    int m_wordSize;
    int m_overlap;
    int m_fftSize;
    int m_wordFormat;
    DataType m_dataType;

    double m_sensitivity;
    double m_sampleRate;

    QPoint m_displayOffset;
    QSize m_headerFontSize;

protected slots:
    void adjustScrollbars() override;
};

#endif // SPECTROGRAMWIDGET_H
