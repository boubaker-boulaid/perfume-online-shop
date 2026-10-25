@php
    $money = fn ($v) => number_format((float) $v, 2, ',', ' ') . ' DA';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New order alert</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f4ef; font-family:Helvetica, Arial, sans-serif;">
    {{-- preheader, invisible but picked up by mail clients --}}
    <div style="display:none; max-height:0; overflow:hidden;">
        New order {{ $order->order_number }} — {{ $order->items->count() }} items, {{ $money($order->total) }}.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f4ef; padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%;">

                    {{-- header --}}
                    <tr>
                        <td align="center" style="background-color:#221a12; padding:28px 40px 24px; border-radius:16px 16px 0 0;">
                            <p style="margin:0 0 6px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:4px; color:#c8a24a;">LUME PERFUMS</p>
                            <p style="margin:0; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#8a7f72;">New order alert</p>
                        </td>
                    </tr>

                    {{-- body --}}
                    <tr>
                        <td style="background-color:#ffffff; padding:40px 40px 0; border-left:1px solid #e8e1d6; border-right:1px solid #e8e1d6;">

                            <h1 style="margin:0 0 4px; font-family:Georgia, 'Times New Roman', serif; font-size:24px; color:#221a12;">
                                A new order has been placed
                            </h1>
                            <p style="margin:0 0 28px; font-size:14px; line-height:22px; color:#6d635a;">
                                {{ $order->created_at?->format('d/m/Y H:i') }} — order {{ $order->order_number }}
                            </p>

                            {{-- quick facts --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                                <tr>
                                    <td style="padding-right:12px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf9f5; border:1px solid #e8e1d6; border-radius:12px;">
                                            <tr>
                                                <td style="padding:14px 16px;">
                                                    <span style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#a2957f;">Status</span><br>
                                                    <span style="background-color:#f3ece2; border-radius:20px; padding:4px 12px; font-size:12px; color:#221a12;">{{ $order->status }}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td>
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf9f5; border:1px solid #e8e1d6; border-radius:12px;">
                                            <tr>
                                                <td style="padding:14px 16px;">
                                                    <span style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#a2957f;">Payment</span><br>
                                                    <span style="background-color:{{ $order->payment_status === 'paid' ? '#e7f0e4' : '#faf0e3' }}; border-radius:20px; padding:4px 12px; font-size:12px; color:#221a12;">{{ $order->payment_status }}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            {{-- customer details --}}
                            <h2 style="margin:0 0 12px; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#221a12;">Customer</h2>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#6d635a; margin-bottom:32px;">
                                <tr>
                                    <td style="padding:6px 0; width:110px; color:#a2957f;">Name</td>
                                    <td style="padding:6px 0; color:#221a12;">{{ $order->customer_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;">Phone</td>
                                    <td style="padding:6px 0; color:#221a12;"><a href="tel:{{ $order->phone }}" style="color:#221a12; text-decoration:none;">{{ $order->phone }}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;">Email</td>
                                    <td style="padding:6px 0; color:#221a12;"><a href="mailto:{{ $order->email }}" style="color:#221a12; text-decoration:none;">{{ $order->email }}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;">City</td>
                                    <td style="padding:6px 0; color:#221a12;">{{ $order->city ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;">Address</td>
                                    <td style="padding:6px 0; color:#221a12;">{{ $order->address ?? '—' }}</td>
                                </tr>
                                @if ($order->note)
                                    <tr>
                                        <td style="padding:6px 0;">Note</td>
                                        <td style="padding:6px 0; color:#221a12;">{{ $order->note }}</td>
                                    </tr>
                                @endif
                            </table>

                            {{-- items --}}
                            <h2 style="margin:0 0 12px; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#221a12;">Items</h2>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:28px;">
                                <tr>
                                    <th align="left" style="border-bottom:2px solid #221a12; padding:8px 8px 8px 0; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Product</th>
                                    <th align="center" style="border-bottom:2px solid #221a12; padding:8px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Qty</th>
                                    <th align="right" style="border-bottom:2px solid #221a12; padding:8px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Price</th>
                                    <th align="right" style="border-bottom:2px solid #221a12; padding:8px 0 8px 8px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Total</th>
                                </tr>
                                @forelse ($order->items as $item)
                                    <tr>
                                        <td style="border-bottom:1px solid #eeeadf; padding:14px 8px 14px 0; font-size:14px; color:#221a12;">{{ $item->product_name }}</td>
                                        <td align="center" style="border-bottom:1px solid #eeeadf; padding:14px 8px; font-size:14px; color:#6d635a;">x{{ $item->quantity }}</td>
                                        <td align="right" style="border-bottom:1px solid #eeeadf; padding:14px 8px; font-size:14px; color:#6d635a;">{{ $money($item->unit_price) }}</td>
                                        <td align="right" style="border-bottom:1px solid #eeeadf; padding:14px 0 14px 8px; font-size:14px; color:#221a12;">{{ $money($item->line_total) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" style="padding:14px 0; font-size:14px; color:#a2957f;">No items recorded for this order.</td>
                                    </tr>
                                @endforelse
                            </table>

                            {{-- totals --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" align="right" style="width:240px; float:right; margin-bottom:32px; font-size:14px; color:#221a12;">
                                <tr>
                                    <td style="padding:6px 0; color:#6d635a;">Subtotal</td>
                                    <td align="right" style="padding:6px 0;">{{ $money($order->subtotal) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0; color:#6d635a;">Shipping</td>
                                    <td align="right" style="padding:6px 0;">{{ $order->shipping_cost == 0 ? 'Free' : $money($order->shipping_cost) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0 0; border-top:2px solid #221a12; font-family:Georgia, 'Times New Roman', serif; font-size:16px;">Total</td>
                                    <td align="right" style="padding:12px 0 0; border-top:2px solid #221a12; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#c8a24a;">{{ $money($order->total) }}</td>
                                </tr>
                            </table>
                            <div style="clear:both;"></div>
                        </td>
                    </tr>

                    {{-- footer --}}
                    <tr>
                        <td align="center" style="background-color:#221a12; padding:24px 40px; border-radius:0 0 16px 16px;">
                            <p style="margin:0; font-size:12px; line-height:18px; color:#8a7f72;">
                                Automatic notification sent by the backend when an order is placed.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
